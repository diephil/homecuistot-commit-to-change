"use client";

import { PageContainer } from "@/components/PageContainer";
import { Text } from "@/components/retroui/Text";

export default function Loading() {
  return (
    <PageContainer
      maxWidth="md"
      gradientFrom="from-cyan-200"
      gradientVia="via-blue-200"
      gradientTo="to-purple-200"
    >
      {/* Decorative background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 md:w-32 md:h-32 bg-cyan-400 border-3 md:border-4 border-black opacity-30 md:transform md:rotate-12 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-24 h-24 md:w-40 md:h-40 bg-blue-400 border-3 md:border-4 border-black opacity-30 md:transform md:-rotate-6 animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 md:w-28 md:h-28 bg-purple-400 border-3 md:border-4 border-black opacity-30 md:transform md:rotate-45 animate-pulse" />
      </div>

      {/* Main loading card */}
      <div className="relative border-4 md:border-6 border-black bg-gradient-to-br from-cyan-300 to-blue-300
        shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]
        p-6 md:p-10 md:transform md:-rotate-1">

        <div className="flex flex-col items-center gap-6 md:gap-8 text-center">
          {/* Loading spinner badge */}
          <div className="bg-blue-400 border-3 md:border-4 border-black p-4 md:p-6
            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
            md:transform md:rotate-2 animate-pulse">
            <div className="relative h-12 w-12 md:h-16 md:w-16">
              {/* Animated cooking icon */}
              <svg
                className="animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
          </div>

          {/* Heading section */}
          <div>
            <Text as="h1" className="text-3xl md:text-5xl font-black uppercase mb-2 md:mb-3 leading-tight tracking-tight">
              Cooking Up Something Good
            </Text>
            <Text as="p" className="text-base md:text-xl font-bold animate-pulse">
              Just a moment...
            </Text>
          </div>

          {/* Loading bars */}
          <div className="w-full max-w-xs space-y-3 md:space-y-4">
            <div className="h-4 bg-white border-2 border-black overflow-hidden">
              <div className="h-full bg-cyan-500 border-r-2 border-black animate-[loading_1.5s_ease-in-out_infinite] w-1/3"></div>
            </div>
            <div className="h-4 bg-white border-2 border-black overflow-hidden">
              <div className="h-full bg-blue-500 border-r-2 border-black animate-[loading_1.5s_ease-in-out_0.2s_infinite] w-1/3"></div>
            </div>
            <div className="h-4 bg-white border-2 border-black overflow-hidden">
              <div className="h-full bg-purple-500 border-r-2 border-black animate-[loading_1.5s_ease-in-out_0.4s_infinite] w-1/3"></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </PageContainer>
  );
}
