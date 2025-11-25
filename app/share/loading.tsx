'use client'

export default function Loading() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <div className="w-full max-w-3xl px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  )
}
