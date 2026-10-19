import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/server-auth";

const schema = z.object({ variantId: z.string().min(1), storeId: z.string().min(1), quantity: z.coerce.number().int().min(1).max(25) });

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const form = await request.formData();
    const input = schema.parse(Object.fromEntries(form.entries()));
    const listing = await prisma.productVariant.findFirst({ where: { id: input.variantId, isActive: true, product: { status: "PUBLISHED", seller: { isActive: true, isSuspended: false } }, inventory: { some: { storeId: input.storeId, store: { isActive: true } } } }, include: { product: { select: { sellerId: true } }, inventory: { where: { storeId: input.storeId }, include: { store: { select: { sellerId: true } } } } } });
    if (!listing || !listing.inventory[0] || listing.inventory[0].store.sellerId !== listing.product.sellerId || listing.inventory[0].quantity - listing.inventory[0].reservedQuantity < input.quantity) return NextResponse.json({ error: "That option is not available in the requested quantity." }, { status: 409 });
    await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.upsert({ where: { userId: user.id }, create: { userId: user.id }, update: {} });
      await tx.cartItem.upsert({ where: { cartId_variantId_storeId: { cartId: cart.id, variantId: input.variantId, storeId: input.storeId } }, create: { cartId: cart.id, variantId: input.variantId, storeId: input.storeId, quantity: input.quantity }, update: { quantity: input.quantity } });
    });
    return NextResponse.redirect(new URL("/cart", request.url), 303);
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid cart item." }, { status: 400 });
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.redirect(new URL("/login", request.url), 303);
    return NextResponse.json({ error: "Unable to update your cart." }, { status: 500 });
  }
}
