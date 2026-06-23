import { Loader2 } from 'lucide-react';

export default function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 w-full h-full">
      <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400 mb-4" />
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">
        Loading...
      </h3>
    </div>
  );
}
