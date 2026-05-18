import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding InvestHub database...");

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: "stocks" }, update: {}, create: { name: "Stocks", slug: "stocks", description: "Stock market analysis", color: "#3B82F6", icon: "📈" } }),
    prisma.category.upsert({ where: { slug: "crypto" }, update: {}, create: { name: "Crypto", slug: "crypto", description: "Cryptocurrency news", color: "#F59E0B", icon: "₿" } }),
    prisma.category.upsert({ where: { slug: "macro" }, update: {}, create: { name: "Macro", slug: "macro", description: "Global macroeconomics", color: "#8B5CF6", icon: "🌍" } }),
    prisma.category.upsert({ where: { slug: "ai-tech" }, update: {}, create: { name: "AI & Tech", slug: "ai-tech", description: "AI and technology", color: "#00C896", icon: "🤖" } }),
  ]);

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@investhub.io" },
    update: {},
    create: { email: "admin@investhub.io", name: "InvestHub Admin", role: "ADMIN" },
  });

  // Sample articles
  await prisma.article.upsert({
    where: { slug: "nvidia-ai-chip-demand-2025" },
    update: {},
    create: {
      title: "NVIDIA's AI Dominance: Why H100 Demand Shows No Signs of Slowing",
      slug: "nvidia-ai-chip-demand-2025",
      excerpt: "NVIDIA continues to dominate the AI accelerator market with H100 and Blackwell chips seeing unprecedented demand from hyperscalers.",
      content: "Full article content would go here...",
      published: true,
      featured: true,
      readTime: 5,
      authorId: admin.id,
      categoryId: categories[3].id,
      tags: ["NVDA", "AI", "semiconductors", "cloud"],
      publishedAt: new Date(),
    },
  });

  // Sample subscription for admin
  await prisma.subscription.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id, plan: "ENTERPRISE", status: "ACTIVE" },
  });

  console.log("✅ Seed complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
