import { NextResponse } from "next/server";
import { ProductStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireMarketplaceRole } from "@/lib/marketplace/authorization";

const schema = z.object({ action: z.enum(["submit", "pause", "archive"]) });
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireMarketplaceRole("SELLER");
    const { id } = await params;
    const input = schema.parse(Object.fromEntries((await request.formData()).entries()));
    const profile = await prisma.sellerProfile.findUnique({ where: { userId: user.id }, select: { id: true } });
    const current = await prisma.product.findFirst({ where: { id, sellerId: profile?.id }, select: { status: true } });
    const transitions: Record<typeof input.action, ProductStatus[]> = { submit: [ProductStatus.DRAFT], pause: [ProductStatus.PUBLISHED], archive: [ProductStatus.DRAFT, ProductStatus.PUBLISHED, ProductStatus.PAUSED] };
    if (!current || !transitions[input.action].includes(current.status)) return NextResponse.json({ error: "Product action is not available in its current state." }, { status: 409 });
    const status = input.action === "submit" ? ProductStatus.SUBMITTED : input.action === "pause" ? ProductStatus.PAUSED : ProductStatus.ARCHIVED;
    const changed = await prisma.product.updateMany({ where: { id, sellerId: profile?.id, status: current.status }, data: { status } });
    if (!changed.count) return NextResponse.json({ error: "Product changed; refresh and try again." }, { status: 409 });
    return NextResponse.redirect(new URL("/seller", request.url), 303);
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid product action." }, { status: 400 });
    if (error instanceof Error && ["UNAUTHORIZED", "FORBIDDEN", "SELLER_NOT_APPROVED"].includes(error.message)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    return NextResponse.json({ error: "Unable to update product." }, { status: 500 });
  }
}
