import "./globals.css";

export const metadata = { title: "ReceiptRadar" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        {/* Top nav */}
        <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-10">
          <nav className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
            <a href="/" className="font-semibold tracking-tight">
              ReceiptRadar
            </a>
            <div className="flex items-center gap-4 text-sm">
              <a href="/receipts" className="hover:underline underline-offset-4">
                Receipts
              </a>
            </div>
          </nav>
        </header>

        {/* Page container */}
        <main className="max-w-5xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
