'use client';

export default function TaskSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
      <div className="flex gap-2 mb-3">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg flex-1"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-12"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-12"></div>
      </div>
      <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </div>
    </div>
  );
}

