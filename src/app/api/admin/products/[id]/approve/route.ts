import { NextResponse } from "next/server";
import { AuditAction, ProductStatus, UserRole } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/server-auth";

const schema = z.object({ action: z.enum(["approve", "reject"]), reason: z.string().trim().max(500).optional() });
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAuth([UserRole.ADMIN]);
    const { id } = await params;
    const input = schema.parse(Object.fromEntries((await request.formData()).entries()));
    const product = await prisma.product.findUnique({ where: { id }, select: { id: true, status: true } });
    if (!product || product.status !== ProductStatus.SUBMITTED) return NextResponse.json({ error: "Product is not awaiting moderation." }, { status: 404 });
    const approved = input.action === "approve";
    await prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data: { status: approved ? ProductStatus.PUBLISHED : ProductStatus.DRAFT, approvedById: approved ? admin.id : null, approvedAt: approved ? new Date() : null, rejectionReason: approved ? null : input.reason ?? "Returned for changes" } });
      await tx.auditLog.create({ data: { actorId: admin.id, actorRole: UserRole.ADMIN, action: approved ? AuditAction.APPROVE : AuditAction.REJECT, entityType: "Product", entityId: id, changes: { previousStatus: product.status, action: input.action, reason: input.reason ?? null } } });
    });
    return NextResponse.redirect(new URL("/admin", request.url), 303);
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid moderation action." }, { status: 400 });
    if (error instanceof Error && ["UNAUTHORIZED", "FORBIDDEN"].includes(error.message)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    return NextResponse.json({ error: "Unable to moderate product." }, { status: 500 });
  }
}
