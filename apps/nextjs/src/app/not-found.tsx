import Link from 'next/link'
import { Button } from '@/components/retroui/Button'
import { PageContainer } from '@/components/PageContainer'

export default function NotFound() {
  return (
    <PageContainer
      maxWidth="md"
      gradientFrom="from-yellow-100"
      gradientVia="via-orange-100"
      gradientTo="to-red-100"
    >
      <div className="border-4 md:border-6 border-black bg-gradient-to-br from-yellow-300 to-orange-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 text-center">
        <div className="space-y-6">
          {/* Error icon */}
          <div className="inline-block bg-red-400 border-4 border-black rounded-full p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <svg
              className="w-12 h-12 md:w-16 md:h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* 404 heading */}
          <h1 className="text-3xl md:text-5xl font-black uppercase">
            404 - Not Found
          </h1>

          {/* Error message */}
          <p className="text-lg md:text-xl font-bold text-gray-800">
            There&apos;s nothing to find here.
          </p>

          {/* Back to Home button */}
          <Button
            asChild
            variant="default"
            size="lg"
            className="mt-6 bg-cyan-400 hover:bg-cyan-500 border-4 border-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}
