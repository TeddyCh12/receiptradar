import Link from 'next/link';

import { formatDate } from '@/lib/date';
import { formatCents } from '@/lib/money';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getReceipts() {
  const account = await prisma.account.findUnique({
    where: { email: 'demo@receiptradar.test' },
    select: { id: true },
  });
  if (!account) return [];
  return prisma.receipt.findMany({
    where: { accountId: account.id },
    orderBy: { purchasedAt: 'desc' },
    select: {
      id: true,
      purchasedAt: true,
      totalCents: true,
      currency: true,
      merchant: { select: { name: true } },
      _count: { select: { items: true } },
    },
  });
}

export default async function ReceiptsPage() {
  const receipts = await getReceipts();

  return (
    <>
      <h1 className="text-2xl font-semibold mb-2">Receipts</h1>
      <p className="text-sm text-gray-600 mb-6">Latest purchases from your inbox.</p>

      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50/70 text-gray-700">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Merchant</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((r, idx) => (
              <tr
                key={r.id}
                className={`${idx % 2 ? 'bg-gray-50/40' : 'bg-white'} border-t hover:bg-gray-50 transition-colors`}
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/receipts/${r.id}`}
                    className="block underline-offset-2 hover:underline"
                  >
                    {formatDate(r.purchasedAt)}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/receipts/${r.id}`} className="block">
                    {r.merchant?.name ?? '—'}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/receipts/${r.id}`} className="block">
                    {r._count.items}
                  </Link>
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">
                  <Link href={`/receipts/${r.id}`} className="block">
                    {formatCents(r.totalCents, r.currency)}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
