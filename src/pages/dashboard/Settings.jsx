import { useState } from 'react'
import { Link } from 'react-router-dom'
import StoreEditor from '../../components/settings/StoreEditor'
import PaymentMethodsForm from '../../components/settings/PaymentMethodsForm'
import LogoCreator from '../../components/settings/LogoCreator'
import { PaintBrushIcon, CreditCardIcon, RectangleGroupIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('store')

  const tabs = [
    { id: 'store', name: 'Quick Settings', icon: PaintBrushIcon },
    { id: 'logo', name: 'Logo Creator', icon: SparklesIcon },
    { id: 'payments', name: 'Payments', icon: CreditCardIcon },
  ]

  return (
    <div>
      {/* Page Builder Banner */}
      <Link
        to="/dashboard/store-builder"
        className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white hover:from-purple-700 hover:to-blue-700 transition-all"
      >
        <div className="flex items-center gap-3">
          <RectangleGroupIcon className="h-6 sm:h-8 w-6 sm:w-8 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-base sm:text-lg">Page Builder</h3>
            <p className="text-purple-100 text-xs sm:text-sm">Build your store with drag-and-drop</p>
          </div>
        </div>
        <span className="px-4 py-2 bg-white/20 rounded-lg font-medium text-sm text-center">
          Open Builder →
        </span>
      </Link>

      {/* Tabs */}
      <div className="flex gap-1 sm:gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <tab.icon className="h-4 sm:h-5 w-4 sm:w-5" />
            {tab.name}
          </button>
        ))}
      </div>

      {activeTab === 'store' && <StoreEditor />}
      {activeTab === 'logo' && <LogoCreator />}
      {activeTab === 'payments' && (
        <div className="max-w-2xl">
          <PaymentMethodsForm />
        </div>
      )}
    </div>
  )
}
