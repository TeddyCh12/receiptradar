export type ParsedEmail = {
  merchant?: string;
  totalCents?: number;
  currency?: string;
  purchasedAt?: Date;
};

function toCents(amount: string) {
  const normalized = amount.replace(/[, ]/g, "");
  const parts = normalized.split(".");
  if (parts.length === 1) return Number(parts[0]) * 100;
  const [d, c = "0"] = parts;
  return Number(d) * 100 + Number(c.padEnd(2, "0").slice(0, 2));
}

export function parseEmailMinimal(raw: string): ParsedEmail {
  const text = raw.trim();

  // currency & total
  let currency = "USD";
  if (/\bEUR\b|€/.test(text)) currency = "EUR";
  if (/\bGBP\b|£/.test(text)) currency = "GBP";

  const moneyMatch =
    text.match(/(?:Total|Amount|Charged|Paid)\s*[:\-]?\s*([$\£\€]?\s?\d[\d,]*(?:\.\d{2})?)/i) ||
    text.match(/([$\£\€]\s?\d[\d,]*(?:\.\d{2})?)/);
  const totalCents =
    moneyMatch?.[1]
      ? toCents(moneyMatch[1].replace(/[^\d.,]/g, ""))
      : undefined;

  // merchant
  const merchantMatch =
    text.match(/\bfrom\s+([A-Z][A-Za-z0-9&.'\- ]{2,})/i) ||
    text.match(/\bMerchant\s*[:\-]\s*([A-Z][A-Za-z0-9&.'\- ]{2,})/i) ||
    text.match(/\bSold by:\s*([A-Z][A-Za-z0-9&.'\- ]{2,})/i);
  const merchant = merchantMatch?.[1]?.trim();

  // date
  const dateMatch =
    text.match(/\b(?:on|date|purchased)\s*[:\-]?\s*([A-Z][a-z]{2,9}\s+\d{1,2},\s+\d{4})/i) ||
    text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  const purchasedAt = dateMatch ? new Date(dateMatch[1]) : new Date();

  return { merchant, totalCents, currency, purchasedAt };
}
