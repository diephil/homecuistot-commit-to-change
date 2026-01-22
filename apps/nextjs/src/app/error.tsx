"use client";

import { useEffect } from "react";
import { Button } from "@/components/retroui/Button";
import { Text } from "@/components/retroui/Text";
import { PageContainer } from "@/components/PageContainer";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <PageContainer
      maxWidth="md"
      gradientFrom="from-red-200"
      gradientVia="via-orange-200"
      gradientTo="to-yellow-200"
    >
      {/* Decorative background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 md:w-32 md:h-32 bg-red-400 border-3 md:border-4 border-black opacity-30 md:transform md:rotate-12" />
        <div className="absolute bottom-20 right-10 w-24 h-24 md:w-40 md:h-40 bg-orange-400 border-3 md:border-4 border-black opacity-30 md:transform md:-rotate-6" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 md:w-28 md:h-28 bg-yellow-400 border-3 md:border-4 border-black opacity-30 md:transform md:rotate-45" />
      </div>

      {/* Main error card */}
      <div className="relative border-4 md:border-6 border-black bg-gradient-to-br from-red-300 to-orange-300
        shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]
        p-6 md:p-10 md:transform md:-rotate-1 transition-all
        hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
        hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[4px] md:hover:translate-y-[4px]">

        <div className="flex flex-col items-center gap-6 md:gap-8 text-center">
          {/* Error icon badge */}
          <div className="bg-red-400 border-3 md:border-4 border-black p-4 md:p-6
            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
            md:transform md:rotate-2">
            <AlertCircle className="h-12 w-12 md:h-16 md:w-16" />
          </div>

          {/* Heading section */}
          <div>
            <Text as="h1" className="text-3xl md:text-5xl font-black uppercase mb-2 md:mb-3 leading-tight tracking-tight">
              Oops! Something Went Wrong
            </Text>
            <Text as="p" className="text-base md:text-xl font-bold">
              Don't worry, even the best chefs burn the toast sometimes!
            </Text>
          </div>

          {/* Error details (optional) */}
          {process.env.NODE_ENV === "development" && (
            <div className="w-full bg-white border-2 border-black p-4 text-left">
              <Text as="p" className="text-sm font-mono break-words">
                {error.message}
              </Text>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-4 md:gap-5 w-full">
            <Button
              onClick={reset}
              variant="default"
              size="lg"
              className="w-full justify-center gap-3 bg-cyan-400 hover:bg-cyan-500 border-4 border-black font-black uppercase text-base md:text-lg
                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[3px] md:hover:translate-y-[3px]
                transition-all md:transform md:hover:rotate-1 py-6 md:py-7"
            >
              <RefreshCw className="h-5 w-5 md:h-6 md:w-6" />
              Try Again
            </Button>

            <Button
              onClick={() => window.location.href = "/"}
              variant="secondary"
              size="lg"
              className="w-full justify-center gap-3 bg-yellow-400 hover:bg-yellow-500 border-4 border-black font-black uppercase text-base md:text-lg
                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[3px] md:hover:translate-y-[3px]
                transition-all md:transform md:hover:-rotate-1 py-6 md:py-7"
            >
              <Home className="h-5 w-5 md:h-6 md:w-6" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
