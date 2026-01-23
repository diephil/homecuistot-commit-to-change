"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/retroui/Button";

/**
 * T052: Error Boundary for unexpected React errors
 * Spec: specs/004-onboarding-flow/tasks.md Phase 7
 */

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // T053: Log error to console (no external service for MVP)
    console.error("[ErrorBoundary] Caught error:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // T053: Additional logging with component stack
    console.error("[ErrorBoundary] Error details:", {
      error,
      errorInfo,
      componentStack: errorInfo.componentStack,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Reload page to reset state
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI or default error display
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-yellow-50 to-cyan-50 p-4">
          <div className="max-w-md w-full border-4 md:border-6 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <div className="bg-red-400 border-b-4 border-black px-6 py-3">
              <h1 className="text-xl font-black uppercase text-center text-white">
                Something went wrong
              </h1>
            </div>

            <div className="p-8 space-y-4">
              <p className="text-gray-700 text-center">
                We encountered an unexpected error. This has been logged and we&apos;ll look into it.
              </p>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="bg-gray-100 border-2 border-gray-300 p-3 rounded text-xs font-mono overflow-auto max-h-48">
                  <p className="font-bold mb-2">Error Details (dev only):</p>
                  <p className="text-red-600">{this.state.error.message}</p>
                  {this.state.error.stack && (
                    <pre className="mt-2 text-gray-600 whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex justify-center">
                <Button
                  onClick={this.handleReset}
                  variant="default"
                  size="lg"
                  className="min-h-[44px]"
                >
                  Reload Page
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
