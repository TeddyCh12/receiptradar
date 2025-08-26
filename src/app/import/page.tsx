import { prisma } from "@/lib/prisma";
import { parseEmailMinimal } from "@/lib/parseEmail";
import { z } from "zod";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const formSchema = z.object({
  raw: z.string().min(20, "Paste at least a few lines from a receipt email."),
});

async function getDemoAccountId() {
  const a = await prisma.account.findUnique({
    where: { email: "demo@receiptradar.test" },
    select: { id: true },
  });
  if (!a) {
    throw new Error("Demo account not found. Did you run the seed?");
  }
  return a.id;
}

async function createFromRaw(formData: FormData) {
  "use server";
  const parsed = formSchema.safeParse({
    raw: String(formData.get("raw") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.flatten().formErrors[0] };

  const { raw } = parsed.data;
  const p = parseEmailMinimal(raw);

  const accountId = await getDemoAccountId();

  // Ensure we have a total; otherwise bail early
  if (!p.totalCents) return { error: "Couldn't find a total in the email." };

  // Upsert merchant if we have a name
  let merchantId: string | undefined = undefined;
  if (p.merchant) {
    const m = await prisma.merchant.upsert({
      where: { name: p.merchant },
      update: {},
      create: { name: p.merchant },
      select: { id: true },
    });
    merchantId = m.id;
  }

  const receipt = await prisma.receipt.create({
    data: {
      accountId,
      merchantId,
      orderId: undefined,
      emailMessageId: undefined,
      totalCents: p.totalCents,
      currency: p.currency ?? "USD",
      purchasedAt: p.purchasedAt ?? new Date(),
      rawSource: { parser: "minimal@v0" },
      rawText: raw,
      items: {
        create: [
          {
            name: "Imported line",
            qty: 1,
            unitPriceCents: p.totalCents, // fallback single-line item
          },
        ],
      },
    },
    select: { id: true },
  });

  redirect(`/receipts/${receipt.id}`);
}

export default function ImportPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Manual Import</h1>
      <p className="text-sm text-gray-600">
        Paste the body of a purchase email below. We’ll parse what we can and
        create a receipt. (MVP parser)
      </p>

      <form action={createFromRaw} className="space-y-3">
        <textarea
          name="raw"
          className="w-full h-56 rounded-xl border p-3 font-mono text-sm"
          placeholder="Paste purchase email text here..."
          required
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
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
