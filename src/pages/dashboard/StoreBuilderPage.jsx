import StoreBuilder from '../../components/settings/StoreBuilder'
import { ComputerDesktopIcon } from '@heroicons/react/24/outline'

export default function StoreBuilderPage() {
  return (
    <>
      {/* Mobile blocker */}
      <div className="sm:hidden flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <ComputerDesktopIcon className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Desktop Required</h2>
        <p className="text-gray-500 max-w-sm">
          The Page Builder requires a larger screen for the best experience. Please open this page on a computer or tablet.
        </p>
      </div>

      {/* Desktop view */}
      <div className="hidden sm:block">
        <StoreBuilder />
      </div>
    </>
  )
}
