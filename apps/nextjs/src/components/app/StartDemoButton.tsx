'use client'

import { useState } from 'react'
import { ConfirmationModal } from './ConfirmationModal'

export function StartDemoButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  function handleStartOnboarding() {
    setIsLoading(true)

    try {
      // Clear localStorage keys
      localStorage.removeItem('homecuistot:story-onboarding')
      localStorage.removeItem('banner:recipes:dismissed')
      localStorage.removeItem('banner:inventory:dismissed')
    } catch {}

    // Hard navigation to onboarding
    window.location.href = '/app/onboarding'
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 font-bold border-4 border-black bg-blue-400 hover:bg-blue-500 text-white text-sm cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"
      >
        🚀 Start Onboarding
      </button>

      <ConfirmationModal
        isOpen={isModalOpen}
        title="Start Onboarding?"
        message="This will take you through the story-based onboarding flow to set up your kitchen inventory and first recipe."
        confirmText="Start Onboarding"
        confirmButtonClass="bg-blue-400 hover:bg-blue-500"
        isLoading={isLoading}
        onConfirm={handleStartOnboarding}
        onCancel={() => setIsModalOpen(false)}
      />
    </>
  )
}
