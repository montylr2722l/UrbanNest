import { NextResponse } from "next/server";
import Decimal from "decimal.js";
import { AuditAction, PaymentStatus, UserRole } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/server-auth";

const schema = z.object({ collectedAmount: z.string().regex(/^\d{1,8}(\.\d{1,2})?$/), reference: z.string().trim().min(3).max(100) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAuth([UserRole.ADMIN]);
    const { id } = await params;
    const input = schema.parse(Object.fromEntries((await request.formData()).entries()));
    const payment = await prisma.payment.findUnique({
      where: { orderId: id },
      include: { order: { select: { id: true, status: true, totalAmount: true, paymentStatus: true, paymentMethod: true } } },
    });
    if (!payment || payment.provider !== "COD" || payment.order.status !== "DELIVERED" || payment.status !== PaymentStatus.COD_PENDING) return NextResponse.json({ error: "Only delivered, unreconciled COD orders can be reconciled." }, { status: 409 });
    if (!new Decimal(input.collectedAmount).equals(payment.amount)) return NextResponse.json({ error: "Collected amount must match the order total exactly." }, { status: 400 });
    await prisma.$transaction(async (tx) => {
      const changed = await tx.payment.updateMany({ where: { id: payment.id, status: PaymentStatus.COD_PENDING }, data: { status: PaymentStatus.COD_COLLECTED, codCollectedAt: new Date(), providerMetadata: { collectedAmount: payment.amount.toFixed(2), reference: input.reference, collectedByAdminId: admin.id } } });
      if (changed.count !== 1) throw new Error("ALREADY_RECONCILED");
      await tx.order.update({ where: { id }, data: { paymentStatus: PaymentStatus.COD_COLLECTED } });
      await tx.auditLog.create({ data: { actorId: admin.id, actorRole: UserRole.ADMIN, action: AuditAction.SETTLE, entityType: "CODPayment", entityId: payment.id, changes: { orderId: id, amount: payment.amount.toFixed(2), reference: input.reference, status: PaymentStatus.COD_COLLECTED }, notes: "Admin recorded COD collection after delivery." } });
    });
    return NextResponse.redirect(new URL("/admin", request.url), 303);
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Enter a valid collected amount and collection reference." }, { status: 400 });
    if (error instanceof Error && error.message === "ALREADY_RECONCILED") return NextResponse.json({ error: "This COD payment was already reconciled." }, { status: 409 });
    if (error instanceof Error && ["UNAUTHORIZED", "FORBIDDEN"].includes(error.message)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    return NextResponse.json({ error: "Unable to reconcile COD collection." }, { status: 500 });
  }
}
