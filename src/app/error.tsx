'use client';

import React, { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[App Router Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 text-stone-900 p-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-red-500 mb-2">Something went wrong!</h1>
      <h2 className="text-lg font-medium mb-4 text-stone-700">An unexpected application error occurred.</h2>
      <p className="max-w-md text-stone-500 mb-8 text-sm font-mono bg-stone-100 p-4 rounded text-left overflow-auto max-h-40 w-full">
        {error.message || 'Error details unavailable.'}
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="inline-flex h-10 items-center justify-center rounded-md bg-stone-900 px-6 font-medium text-stone-50 transition-colors hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
        >
          Try Again
        </button>
        <a
          href="/dashboard"
          className="inline-flex h-10 items-center justify-center rounded-md border border-stone-200 bg-white px-6 font-medium text-stone-700 transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
