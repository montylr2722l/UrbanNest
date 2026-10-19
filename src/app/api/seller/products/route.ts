import { NextResponse } from "next/server";
import { ProductStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireMarketplaceRole } from "@/lib/marketplace/authorization";
import { generateSlugWithSuffix } from "@/lib/utils/slug";
import Decimal from "decimal.js";

const productSchema = z.object({ name: z.string().trim().min(3).max(120), categoryId: z.string().min(1), description: z.string().max(4000).optional(), sku: z.string().trim().min(2).max(64), price: z.string().regex(/^\d{1,8}(\.\d{1,2})?$/), quantity: z.coerce.number().int().min(0).max(100000), size: z.string().max(24).optional(), color: z.string().max(40).optional() });

export async function POST(request: Request) {
  try {
    const user = await requireMarketplaceRole("SELLER");
    const form = await request.formData();
    const input = productSchema.parse(Object.fromEntries(form.entries()));
    const profile = await prisma.sellerProfile.findUnique({ where: { userId: user.id }, include: { stores: { where: { isActive: true }, take: 1 } } });
    const category = await prisma.category.findFirst({ where: { id: input.categoryId, isActive: true }, select: { id: true } });
    const store = profile?.stores[0];
    if (!profile || !store || !category) return NextResponse.json({ error: "Store or category is unavailable." }, { status: 400 });
    const product = await prisma.product.create({ data: {
      sellerId: profile.id, categoryId: category.id, name: input.name, slug: generateSlugWithSuffix(input.name, crypto.randomUUID().slice(0, 8)), description: input.description, status: ProductStatus.DRAFT,
      variants: { create: { sku: input.sku, price: new Decimal(input.price), size: input.size || null, color: input.color || null, inventory: { create: { storeId: store.id, quantity: input.quantity } } } },
    }, select: { id: true } });
    return NextResponse.redirect(new URL(`/seller?created=${product.id}`, request.url), 303);
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid product data." }, { status: 400 });
    if (error instanceof Error && ["UNAUTHORIZED", "FORBIDDEN", "SELLER_NOT_APPROVED"].includes(error.message)) return NextResponse.json({ error: "An approved seller account is required." }, { status: 403 });
    return NextResponse.json({ error: "Unable to save product. Check that the SKU is unique." }, { status: 500 });
  }
}
