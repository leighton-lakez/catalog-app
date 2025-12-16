import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [reseller, setReseller] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchOrCreateReseller = useCallback(async (authUser, retries = 3) => {
    if (!authUser) return null

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Try to fetch existing reseller profile
        const { data, error } = await supabase
          .from('resellers')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle()

        if (data) {
          setReseller(data)
          return data
        }

        if (!data && (!error || error.code === 'PGRST116')) {
          // No profile found - create one
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
            // If insert fails due to conflict, try fetching again
            if (createError.code === '23505') {
              const { data: existingReseller } = await supabase
                .from('resellers')
                .select('*')
                .eq('id', authUser.id)
                .maybeSingle()

              if (existingReseller) {
                setReseller(existingReseller)
                return existingReseller
              }
            }
            console.error('Error creating reseller profile:', createError)
          } else if (newReseller) {
            setReseller(newReseller)
            return newReseller
          }
        } else if (error) {
          throw error
        }
      } catch (error) {
        console.error(`Reseller fetch attempt ${attempt} failed:`, error)
        if (attempt < retries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 500 * attempt))
        }
      }
    }
    return null
  }, [])

  useEffect(() => {
    let mounted = true

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error getting session:', error)
        }

        if (!mounted) return

        if (session?.user) {
          setUser(session.user)
          await fetchOrCreateReseller(session.user)
        } else {
          setUser(null)
          setReseller(null)
        }
      } catch (error) {
        console.error('Auth init error:', error)
      } finally {
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

        console.log('Auth state changed:', event)

        if (session?.user) {
          setUser(session.user)
          // Fetch reseller in background, don't block
          fetchOrCreateReseller(session.user)
        } else {
          setUser(null)
          setReseller(null)
        }
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchOrCreateReseller])

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
    // Clear any stale state first
    setUser(null)
    setReseller(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Immediately set user and fetch reseller
    if (data.user) {
      setUser(data.user)
      await fetchOrCreateReseller(data.user)
    }

    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setReseller(null)
  }

  const updateReseller = async (updates) => {
    if (!user) throw new Error('No user logged in')

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
