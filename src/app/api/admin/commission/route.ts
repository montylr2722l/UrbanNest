import { NextResponse } from "next/server";
import Decimal from "decimal.js";
import { AuditAction, CommissionRuleType, UserRole } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/server-auth";

const schema = z.object({ percent: z.string().regex(/^(?:0|[1-9]\d?)(?:\.\d{1,2})?$/) }).refine(({ percent }) => new Decimal(percent).lessThanOrEqualTo(50), "Rate must be 50% or less");
export async function POST(request: Request) {
  try {
    const admin = await requireAuth([UserRole.ADMIN]);
    const input = schema.parse(Object.fromEntries((await request.formData()).entries()));
    const rate = new Decimal(input.percent).dividedBy(100).toDecimalPlaces(4, Decimal.ROUND_HALF_UP);
    await prisma.$transaction(async (tx) => {
      const rule = await tx.commissionRule.create({ data: { type: CommissionRuleType.GLOBAL, rate, description: `Global commission set to ${input.percent}%`, createdById: admin.id } });
      await tx.auditLog.create({ data: { actorId: admin.id, actorRole: UserRole.ADMIN, action: AuditAction.CONFIGURE, entityType: "CommissionRule", entityId: rule.id, changes: { rate: rate.toString(), percent: input.percent } } });
    });
    return NextResponse.redirect(new URL("/admin", request.url), 303);
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Enter a commission rate from 0 to 50 percent." }, { status: 400 });
    if (error instanceof Error && ["UNAUTHORIZED", "FORBIDDEN"].includes(error.message)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    return NextResponse.json({ error: "Unable to update commission." }, { status: 500 });
  }
}
