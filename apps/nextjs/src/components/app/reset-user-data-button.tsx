'use client'

import { useState, useEffect } from 'react'
import { resetUserData } from '@/app/actions/user-data'

export function ResetUserDataButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isModalOpen])

  async function handleReset() {
    setIsLoading(true)
    const result = await resetUserData()

    if (result.success) {
      // Hard navigation to bypass client cache
      window.location.href = '/app/onboarding'
    } else {
      setIsLoading(false)
      setIsModalOpen(false)
      alert(result.error ?? 'Failed to reset data')
    }
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 font-bold border-4 border-black bg-red-500 hover:bg-red-600 text-white text-sm cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"
      >
        ⚠️ Reset user data
      </button>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => !isLoading && setIsModalOpen(false)}
        >
          <div
            className="mx-4 max-w-md w-full p-6 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-black mb-4">Reset All Data?</h2>
            <p className="mb-6">
              This will permanently delete all your recipes, ingredients, cooking logs, and inventory.
              You will be redirected to the onboarding to start fresh.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isLoading}
                className="px-4 py-2 font-bold border-4 border-black bg-gray-200 hover:bg-gray-300 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={isLoading}
                className="px-4 py-2 font-bold border-4 border-black bg-red-400 hover:bg-red-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? 'Resetting...' : 'Yes, reset everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
