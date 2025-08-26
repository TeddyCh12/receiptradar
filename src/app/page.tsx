import Link from "next/link";

export default function Home() {
  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-semibold">ReceiptRadar</h1>
      <p>Welcome. Head to your receipts list:</p>
      <Link href="/receipts" className="text-blue-600 underline">
        View Receipts
      </Link>
    </main>
  );
}
