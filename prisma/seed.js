// prisma/seed.js (CommonJS so it runs anywhere)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Account (unique by email)
  const account = await prisma.account.upsert({
    where: { email: 'demo@receiptradar.test' },
    update: {},
    create: { email: 'demo@receiptradar.test' },
  });

  // Merchant (no unique on name; find or create)
  let merchant = await prisma.merchant.findFirst({ where: { name: 'Amazon' } });
  if (!merchant) {
    merchant = await prisma.merchant.create({
      data: { name: 'Amazon', domain: 'amazon.com' },
    });
  }

  // One receipt with two items; cents to avoid float woes
  await prisma.receipt.create({
    data: {
      accountId: account.id,
      merchantId: merchant.id,
      orderId: 'ORDER-123',
      emailMessageId: 'msg-001',
      totalCents: 2599, // 12.99 + 13.00
      currency: 'USD',
      purchasedAt: new Date('2024-12-15T10:00:00Z'),
      rawSource: { from: 'order-update@amazon.com', subject: 'Your order' },
      rawText: 'Thank you for your order!',
      items: {
        create: [
          { name: 'USB-C Cable', qty: 1, unitPriceCents: 1299 },
          { name: 'Phone Case',  qty: 1, unitPriceCents: 1300 },
        ],
      },
    },
  });

  console.log('Seeded: demo account + Amazon receipt with 2 items.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
