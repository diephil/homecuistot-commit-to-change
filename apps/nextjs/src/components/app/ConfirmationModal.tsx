'use client'

import { useEffect } from 'react'

interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  confirmButtonClass: string
  isLoading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText,
  confirmButtonClass,
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={() => !isLoading && onCancel()}
    >
      <div
        className="mx-4 max-w-md w-full p-6 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-black mb-4">{title}</h2>
        <p className="mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 font-bold border-4 border-black bg-gray-200 hover:bg-gray-300 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 font-bold border-4 border-black disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed ${confirmButtonClass}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
