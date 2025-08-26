import { redirect } from 'next/navigation';
import { z } from 'zod';

import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { parseEmailMinimal } from '@/lib/parseEmail';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const formSchema = z.object({
  raw: z.string().min(20, 'Paste at least a few lines from a receipt email.'),
});

async function getDemoAccountId() {
  const a = await prisma.account.findUnique({
    where: { email: 'demo@receiptradar.test' },
    select: { id: true },
  });
  if (!a) {
    throw new Error('Demo account not found. Did you run the seed?');
  }
  return a.id;
}

async function createFromRaw(formData: FormData): Promise<void> {
  'use server';
  const parsed = formSchema.safeParse({
    raw: String(formData.get('raw') ?? ''),
  });
  if (!parsed.success) {
    // Simple UX for now: bounce back with a query param
    redirect('/import?error=paste+more+text');
  }

  const { raw } = parsed.data;
  const p = parseEmailMinimal(raw);

  const accountId = await getDemoAccountId();

  if (!p.totalCents) {
    redirect('/import?error=couldnt+find+total');
  }

  let merchantId: string | undefined;
  if (p.merchant) {
    const existing = await prisma.merchant.findFirst({
      where: { name: p.merchant },
      select: { id: true },
    });
    merchantId = existing
      ? existing.id
      : (await prisma.merchant.create({ data: { name: p.merchant }, select: { id: true } })).id;
  }

  const receipt = await prisma.receipt.create({
    data: {
      accountId,
      merchantId: merchantId ?? null, // prisma type is string | null
      // omit optional fields you don't use or set them to null explicitly
      orderId: null,
      emailMessageId: null,
      totalCents: p.totalCents, // defined due to guard above
      currency: p.currency,
      purchasedAt: p.purchasedAt,
      rawSource: { parser: 'minimal@v0' },
      rawText: raw,
      items: {
        create: [
          {
            name: 'Imported line',
            qty: 1,
            unitPriceCents: p.totalCents!,
          },
        ],
      },
    },
    select: { id: true },
  });

  logger.info('receipt.created', {
    env: env.NODE_ENV,
    accountId,
    merchantId: merchantId ?? null,
    receiptId: receipt.id,
    totalCents: p.totalCents,
    currency: p.currency,
  });

  redirect(`/receipts/${receipt.id}`);
}

export default function ImportPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Manual Import</h1>
      <p className="text-sm text-gray-600">
        Paste the body of a purchase email below. We will parse what we can and create a receipt.
      </p>

      <form action={createFromRaw} className="space-y-3">
        <textarea
          name="raw"
          className="w-full h-56 rounded-xl border p-3 font-mono text-sm"
          placeholder="Paste purchase email text here..."
          required
        />
        <div className="flex items-center gap-3">
          <button type="submit" className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">
            Import
          </button>
          <span className="text-xs text-gray-500">
            We only store this text to reproduce parsing and improve it later.
          </span>
        </div>
      </form>
    </div>
  );
}
