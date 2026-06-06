'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Global Error]', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-stone-50 text-stone-900 p-6 text-center font-sans">
        <h1 className="text-4xl font-bold tracking-tight text-red-500 mb-2">Critical System Error</h1>
        <h2 className="text-lg font-medium mb-4 text-stone-700">A fatal error crashed the root layout.</h2>
        <p className="max-w-md text-stone-500 mb-8 text-sm font-mono bg-stone-100 p-4 rounded text-left overflow-auto max-h-40 w-full font-mono">
          {error.message || 'Critical layout error occurred.'}
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex h-10 items-center justify-center rounded-md bg-stone-900 px-6 font-medium text-stone-50 transition-colors hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
        >
          Refresh Layout
        </button>
      </body>
    </html>
  );
}
