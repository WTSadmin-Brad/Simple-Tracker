/**
 * Auth Login Page Loading UI
 * Displayed during streaming while the page is loading
 */

export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo placeholder */}
        <div className="mx-auto h-12 w-12 animate-pulse bg-gray-200 rounded-full"></div>
        
        {/* Title placeholder */}
        <div className="animate-pulse mx-auto">
          <div className="h-7 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
        </div>
        
        {/* Form placeholder */}
        <div className="animate-pulse mt-8 space-y-6 bg-white p-8 rounded-lg shadow-sm">
          <div className="space-y-4">
            <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            
            <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            
            <div className="h-5 bg-gray-200 rounded w-full"></div>
          </div>
          
          <div className="h-12 bg-gray-200 rounded w-full mt-6"></div>
        </div>
      </div>
    </div>
  );
}
