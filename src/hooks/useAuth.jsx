import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [reseller, setReseller] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Get initial session with timeout
    const initAuth = async () => {
      // Set a maximum timeout of 5 seconds
      const timeout = setTimeout(() => {
        if (mounted && loading) {
          console.warn('Auth initialization timed out')
          setLoading(false)
        }
      }, 5000)

      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!mounted) return

        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchOrCreateReseller(session.user)
        }
      } catch (error) {
        console.error('Auth init error:', error)
      } finally {
        clearTimeout(timeout)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        setUser(session?.user ?? null)

        if (session?.user) {
          // Don't await - let it run in background
          fetchOrCreateReseller(session.user)
        } else {
          setReseller(null)
        }
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchOrCreateReseller = async (authUser) => {
    try {
      // Try to fetch existing reseller profile with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const { data, error } = await supabase
        .from('resellers')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()
        .abortSignal(controller.signal)

      clearTimeout(timeoutId)

      if (data) {
        setReseller(data)
      } else if (!data && (!error || error.code === 'PGRST116')) {
        // No profile found - try to create one
        const storeName = authUser.user_metadata?.store_name || 'My Store'
        const storeSlug = authUser.user_metadata?.store_slug ||
          'store-' + authUser.id.substring(0, 8) + '-' + Date.now().toString(36)

        const { data: newReseller, error: createError } = await supabase
          .from('resellers')
          .insert({
            id: authUser.id,
            store_name: storeName,
            store_slug: storeSlug,
          })
          .select()
          .maybeSingle()

        if (createError) {
          console.error('Error creating reseller profile:', createError)
        } else if (newReseller) {
          setReseller(newReseller)
        }
      } else if (error) {
        console.error('Error fetching reseller:', error)
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Reseller fetch timed out')
      } else {
        console.error('Error in fetchOrCreateReseller:', error)
      }
    }
  }

  const signUp = async (email, password, storeName) => {
    const slug = storeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          store_name: storeName,
          store_slug: slug,
        }
      }
    })

    if (error) throw error
    return data
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setReseller(null)
  }

  const updateReseller = async (updates) => {
    const { data, error } = await supabase
      .from('resellers')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    setReseller(data)
    return data
  }

  const value = {
    user,
    reseller,
    loading,
    signUp,
    signIn,
    signOut,
    updateReseller,
    refreshReseller: () => user && fetchOrCreateReseller(user),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
