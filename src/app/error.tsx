// src/app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <button className="mt-4 rounded bg-indigo-600 px-4 py-2 text-white" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
