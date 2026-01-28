import { PageContainer } from "@/components/PageContainer";

export default function OnboardingLoading() {
  return (
    <PageContainer
      maxWidth="2xl"
      gradientFrom="from-pink-50"
      gradientVia="via-yellow-50"
      gradientTo="to-cyan-50"
    >
      <div className="border-4 md:border-6 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        {/* Progress bar skeleton */}
        <div className="bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 border-b-4 md:border-b-6 border-black px-6 py-3">
          <div className="h-4 w-24 bg-black/20 rounded mx-auto animate-pulse" />
        </div>

        {/* Content skeleton */}
        <div className="p-8 flex flex-col items-center gap-6">
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-48 bg-gray-100 rounded animate-pulse" />
          <div className="flex gap-4 mt-4">
            <div className="w-12 h-12 bg-pink-200 border-4 border-black rotate-12 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-12 h-12 bg-yellow-200 border-4 border-black -rotate-12 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-12 h-12 bg-cyan-200 border-4 border-black rotate-6 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
