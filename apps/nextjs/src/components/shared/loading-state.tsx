"use client";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Processing..." }: LoadingStateProps) {
  return (
    <div className="space-y-4 py-12">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin h-12 w-12 border-4 border-black border-t-transparent rounded-full" />
        <p className="text-lg font-semibold">{message}</p>
      </div>
    </div>
  );
}
