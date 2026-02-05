'use client'

import { useState } from 'react'
import { resetUserData } from '@/app/actions/user-data'
import { ConfirmationModal } from './ConfirmationModal'
import { COMPLETION_FLAG_KEY } from '@/lib/story-onboarding/constants'

export function ResetUserDataButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleReset() {
    setIsLoading(true)

    try {
      localStorage.removeItem('banner:recipes:dismissed')
      localStorage.removeItem('banner:inventory:dismissed')
      localStorage.removeItem('inventory:groupByCategory')
      localStorage.removeItem('inventory:showEmptyOnly')
      localStorage.removeItem('homecuistot:story-onboarding')
      localStorage.removeItem(COMPLETION_FLAG_KEY)
    } catch {}

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

      <ConfirmationModal
        isOpen={isModalOpen}
        title="Reset All Data?"
        message="This will permanently delete all your recipes, ingredients, cooking logs, and inventory. You will be redirected to the onboarding to start fresh."
        confirmText="Yes, reset everything"
        confirmButtonClass="bg-red-400 hover:bg-red-500"
        isLoading={isLoading}
        onConfirm={handleReset}
        onCancel={() => setIsModalOpen(false)}
      />
    </>
  )
}
