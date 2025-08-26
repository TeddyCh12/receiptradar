import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import { formatDate } from "@/lib/date";

export const dynamic = "force-dynamic";

async function getReceipt(id: string) {
  return prisma.receipt.findUnique({
    where: { id },
    include: {
      merchant: { select: { name: true } },
      items: { select: { id: true, name: true, qty: true, unitPriceCents: true } },
    },
  });
}

export default async function ReceiptDetail({
  params,
}: { params: { id: string } }) {
  const receipt = await getReceipt(params.id);
  if (!receipt) notFound();

  const itemsTotal = receipt.items.reduce(
    (sum, it) => sum + it.qty * it.unitPriceCents,
    0
  );
  const delta = itemsTotal - receipt.totalCents;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {receipt.merchant?.name ?? "Unknown Merchant"}
          </h1>
          <p className="text-sm text-gray-600">
            {formatDate(receipt.purchasedAt)}{" "}
            {receipt.orderId ? (
              <span className="text-gray-400">• Order {receipt.orderId}</span>
            ) : null}
          </p>
        </div>
        <div className="text-right font-mono tabular-nums text-lg">
          {formatCents(receipt.totalCents, receipt.currency)}
        </div>
      </div>

      {/* Items */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50/70 text-gray-700">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Unit</th>
              <th className="px-4 py-3 font-medium text-right">Line</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((it, idx) => {
              const line = it.qty * it.unitPriceCents;
              return (
                <tr
                  key={it.id}
                  className={`${idx % 2 ? "bg-gray-50/40" : "bg-white"} border-t`}
                >
                  <td className="px-4 py-3">{it.name}</td>
                  <td className="px-4 py-3">{it.qty}</td>
                  <td className="px-4 py-3 font-mono tabular-nums">
                    {formatCents(it.unitPriceCents, receipt.currency)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">
                    {formatCents(line, receipt.currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t bg-gray-50/70">
              <td className="px-4 py-3" colSpan={3}>
                Items total
              </td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">
                {formatCents(itemsTotal, receipt.currency)}
              </td>
            </tr>
            {delta !== 0 && (
              <tr className="border-t">
                <td className="px-4 py-3 text-gray-600" colSpan={3}>
                  Adjustment vs receipt total
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">
                  {formatCents(delta, receipt.currency)}
                </td>
              </tr>
            )}
          </tfoot>
        </table>
      </div>

      {/* Raw */}
      {(receipt.rawText || receipt.rawSource) && (
        <details className="rounded-xl border bg-white shadow-sm p-4">
          <summary className="cursor-pointer select-none text-sm font-medium">
            Raw email data
          </summary>
          {receipt.rawText && (
            <pre className="mt-3 whitespace-pre-wrap text-xs text-gray-700 bg-gray-50 p-3 rounded-lg border">
              {receipt.rawText}
            </pre>
          )}
          {receipt.rawSource && (
            <pre className="mt-3 whitespace-pre-wrap text-xs text-gray-700 bg-gray-50 p-3 rounded-lg border">
              {JSON.stringify(receipt.rawSource, null, 2)}
            </pre>
          )}
        </details>
      )}

      <div>
        <Link href="/receipts" className="text-sm underline underline-offset-4">
          ← Back to Receipts
        </Link>
      </div>
    </div>
  );
}
