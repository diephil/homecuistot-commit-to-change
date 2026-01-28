'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { startDemoData } from '@/app/actions/user-data'
import { ConfirmationModal } from './confirmation-modal'

export function StartDemoButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleStartDemo() {
    setIsLoading(true)
    const result = await startDemoData()

    if (result.success) {
      setIsLoading(false)
      setIsModalOpen(false)
      router.refresh() // Trigger re-render with new demo data
    } else {
      setIsLoading(false)
      setIsModalOpen(false)
      alert(result.error ?? 'Failed to start demo')
    }
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 font-bold border-4 border-black bg-blue-400 hover:bg-blue-500 text-white text-sm cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"
      >
        🚀 Start Demo
      </button>

      <ConfirmationModal
        isOpen={isModalOpen}
        title="Start Demo Mode?"
        message="This will replace all your existing data with demo recipes and ingredients to help you explore the app's features. Your current data will be permanently deleted."
        confirmText="Start Demo"
        confirmButtonClass="bg-blue-400 hover:bg-blue-500"
        isLoading={isLoading}
        onConfirm={handleStartDemo}
        onCancel={() => setIsModalOpen(false)}
      />
    </>
  )
}
