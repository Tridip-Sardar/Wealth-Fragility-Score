"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="my-8 p-6 rounded-md bg-[#FAF0ED] border border-[#F2D6CF] text-[#B54834] space-y-3">
          <div className="flex items-center gap-2 font-semibold text-sm sm:text-base">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{this.props.fallbackTitle || "Something went wrong displaying results."}</span>
          </div>
          <p className="text-xs sm:text-sm text-[#1A2332]/80">
            An unexpected error occurred while rendering this section. Please try calculating your score again.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="px-4 py-2 rounded text-xs font-medium bg-[#B54834] text-white hover:bg-[#993b2a] transition cursor-pointer"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
