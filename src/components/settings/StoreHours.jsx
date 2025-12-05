import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../ui/Button'
import { Textarea } from '../ui/Input'
import {
  ClockIcon,
  SunIcon,
  MoonIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
]

const DEFAULT_HOURS = {
  monday: { open: '09:00', close: '17:00', closed: false },
  tuesday: { open: '09:00', close: '17:00', closed: false },
  wednesday: { open: '09:00', close: '17:00', closed: false },
  thursday: { open: '09:00', close: '17:00', closed: false },
  friday: { open: '09:00', close: '17:00', closed: false },
  saturday: { open: '10:00', close: '14:00', closed: false },
  sunday: { open: null, close: null, closed: true },
}

export default function StoreHours() {
  const { reseller, updateReseller } = useAuth()
  const [hours, setHours] = useState(DEFAULT_HOURS)
  const [vacationMode, setVacationMode] = useState(false)
  const [vacationMessage, setVacationMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (reseller) {
      setHours(reseller.store_hours || DEFAULT_HOURS)
      setVacationMode(reseller.vacation_mode || false)
      setVacationMessage(reseller.vacation_message || '')
    }
  }, [reseller])

  const handleDayChange = (day, field, value) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      }
    }))
    setSaved(false)
  }

  const toggleDayClosed = (day) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        closed: !prev[day].closed,
      }
    }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateReseller({
        store_hours: hours,
        vacation_mode: vacationMode,
        vacation_message: vacationMessage,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Error saving store hours:', error)
      alert('Error saving store hours')
    } finally {
      setSaving(false)
    }
  }

  const isCurrentlyOpen = () => {
    if (vacationMode) return false

    const now = new Date()
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const today = dayNames[now.getDay()]
    const todayHours = hours[today]

    if (todayHours.closed) return false

    const currentTime = now.getHours() * 60 + now.getMinutes()
    const [openHour, openMin] = todayHours.open.split(':').map(Number)
    const [closeHour, closeMin] = todayHours.close.split(':').map(Number)
    const openTime = openHour * 60 + openMin
    const closeTime = closeHour * 60 + closeMin

    return currentTime >= openTime && currentTime <= closeTime
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ClockIcon className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Store Hours</h2>
            <p className="text-sm text-gray-500">Set when your store accepts orders</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isCurrentlyOpen() ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Open Now
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              <MoonIcon className="h-4 w-4" />
              Closed
            </span>
          )}
        </div>
      </div>

      {/* Vacation Mode */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-yellow-800">Vacation Mode</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={vacationMode}
                  onChange={(e) => {
                    setVacationMode(e.target.checked)
                    setSaved(false)
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
              </label>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Pause all orders temporarily. Customers will see your vacation message.
            </p>
            {vacationMode && (
              <Textarea
                className="mt-3"
                placeholder="We're taking a short break and will be back soon!"
                value={vacationMessage}
                onChange={(e) => {
                  setVacationMessage(e.target.value)
                  setSaved(false)
                }}
                rows={2}
              />
            )}
          </div>
        </div>
      </div>

      {/* Hours Grid */}
      <div className="space-y-3">
        {DAYS.map(({ key, label }) => (
          <div
            key={key}
            className={`flex items-center gap-4 p-3 rounded-lg ${hours[key].closed ? 'bg-gray-50' : 'bg-white'}`}
          >
            <div className="w-28">
              <span className={`font-medium ${hours[key].closed ? 'text-gray-400' : 'text-gray-900'}`}>
                {label}
              </span>
            </div>

            <button
              onClick={() => toggleDayClosed(key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                hours[key].closed
                  ? 'bg-gray-200 text-gray-600'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {hours[key].closed ? 'Closed' : 'Open'}
            </button>

            {!hours[key].closed && (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="time"
                  value={hours[key].open || '09:00'}
                  onChange={(e) => handleDayChange(key, 'open', e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="time"
                  value={hours[key].close || '17:00'}
                  onChange={(e) => handleDayChange(key, 'close', e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-6 pt-4 border-t">
        <Button
          onClick={handleSave}
          loading={saving}
          className={saved ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          {saved ? '✓ Saved!' : 'Save Hours'}
        </Button>
      </div>
    </div>
  )
}
