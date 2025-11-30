import { useState } from 'react'
import StoreEditor from '../../components/settings/StoreEditor'
import PaymentMethodsForm from '../../components/settings/PaymentMethodsForm'
import { PaintBrushIcon, CreditCardIcon } from '@heroicons/react/24/outline'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('store')

  const tabs = [
    { id: 'store', name: 'Store Design', icon: PaintBrushIcon },
    { id: 'payments', name: 'Payments', icon: CreditCardIcon },
  ]

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <tab.icon className="h-5 w-5" />
            {tab.name}
          </button>
        ))}
      </div>

      {activeTab === 'store' && <StoreEditor />}
      {activeTab === 'payments' && (
        <div className="max-w-2xl">
          <PaymentMethodsForm />
        </div>
      )}
    </div>
  )
}
