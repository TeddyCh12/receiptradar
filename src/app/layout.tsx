// src/app/layout.tsx
import './globals.css';
import Link from 'next/link';

import { env } from '@/lib/env';

export const metadata = { title: 'Receipt Radar' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <Link href="/" className="font-semibold tracking-tight">
              {env.NEXT_PUBLIC_APP_NAME}
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-4xl p-4">{children}</main>
      </body>
    </html>
  );
}
