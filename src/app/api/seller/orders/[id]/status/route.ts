import { NextResponse } from "next/server";
import { SellerOrderStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireMarketplaceRole } from "@/lib/marketplace/authorization";

const schema = z.object({ status: z.nativeEnum(SellerOrderStatus) });
const transitions: Partial<Record<SellerOrderStatus, SellerOrderStatus[]>> = {
  PENDING: ["ACCEPTED"], ACCEPTED: ["PROCESSING"], PROCESSING: ["SHIPPED"],
  SHIPPED: ["OUT_FOR_DELIVERY", "DELIVERED"], OUT_FOR_DELIVERY: ["DELIVERED"],
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireMarketplaceRole("SELLER");
    const { id } = await params;
    const input = schema.parse(Object.fromEntries((await request.formData()).entries()));
    const profile = await prisma.sellerProfile.findUnique({ where: { userId: user.id }, select: { id: true } });
    const order = await prisma.sellerOrder.findFirst({ where: { id, sellerId: profile?.id }, select: { orderId: true, status: true } });
    if (!order || !transitions[order.status]?.includes(input.status)) return NextResponse.json({ error: "Order status transition is not allowed." }, { status: 409 });
    await prisma.$transaction(async (tx) => {
      const result = await tx.sellerOrder.updateMany({ where: { id, sellerId: profile?.id, status: order.status }, data: { status: input.status, ...(input.status === "DELIVERED" ? { deliveredAt: new Date() } : {}), ...(input.status === "SHIPPED" ? { shippedAt: new Date() } : {}) } });
      if (result.count !== 1) throw new Error("ORDER_CHANGED");
      const siblings = await tx.sellerOrder.findMany({ where: { orderId: order.orderId }, select: { status: true } });
      const statuses = siblings.map((sibling) => sibling.status);
      const parentStatus = statuses.every((status) => status === "DELIVERED") ? "DELIVERED"
        : statuses.every((status) => status === "CANCELLED") ? "CANCELLED"
        : statuses.some((status) => ["OUT_FOR_DELIVERY"].includes(status)) ? "OUT_FOR_DELIVERY"
        : statuses.some((status) => status === "SHIPPED") ? "SHIPPED"
        : statuses.some((status) => ["PROCESSING", "ACCEPTED"].includes(status)) ? "PROCESSING"
        : "CONFIRMED";
      await tx.order.update({ where: { id: order.orderId }, data: { status: parentStatus } });
    }, { isolationLevel: "Serializable" });
    return NextResponse.redirect(new URL("/seller/orders", request.url), 303);
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    if (error instanceof Error && error.message === "ORDER_CHANGED") return NextResponse.json({ error: "Order changed; refresh and try again." }, { status: 409 });
    if (error instanceof Error && ["UNAUTHORIZED", "FORBIDDEN", "SELLER_NOT_APPROVED"].includes(error.message)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    return NextResponse.json({ error: "Unable to update order." }, { status: 500 });
  }
}
