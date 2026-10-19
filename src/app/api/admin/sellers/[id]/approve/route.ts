import { NextResponse } from "next/server";
import { AuditAction, SellerOnboardingStatus, UserRole } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/server-auth";

const reviewSchema = z.object({ action: z.enum(["approve", "reject"]), reason: z.string().trim().max(500).optional() });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAuth([UserRole.ADMIN]);
    const { id } = await params;
    const form = await request.formData();
    const input = reviewSchema.parse(Object.fromEntries(form.entries()));
    const profile = await prisma.sellerProfile.findUnique({ where: { id }, include: { stores: true } });
    if (!profile || profile.onboardingStatus !== SellerOnboardingStatus.PROFILE_SUBMITTED) {
      return NextResponse.json({ error: "Application is not awaiting review." }, { status: 404 });
    }
    await prisma.$transaction(async (tx) => {
      const approved = input.action === "approve";
      await tx.sellerProfile.update({ where: { id }, data: {
        onboardingStatus: approved ? SellerOnboardingStatus.ACTIVE : SellerOnboardingStatus.PROFILE_INCOMPLETE,
        isActive: approved,
        isSuspended: false,
      } });
      await tx.store.updateMany({ where: { sellerId: id }, data: { isActive: approved } });
      await tx.auditLog.create({ data: {
        actorId: admin.id, actorRole: UserRole.ADMIN,
        action: approved ? AuditAction.APPROVE : AuditAction.REJECT,
        entityType: "SellerProfile", entityId: id,
        changes: { action: input.action, reason: input.reason ?? null },
      } });
    });
    return NextResponse.json({ message: input.action === "approve" ? "Seller approved." : "Application returned for correction." });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid review data." }, { status: 400 });
    if (error instanceof Error && ["UNAUTHORIZED", "FORBIDDEN"].includes(error.message)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    return NextResponse.json({ error: "Unable to review application." }, { status: 500 });
  }
}
