import { NextResponse } from "next/server";
import { AuditAction, UserRole } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/server-auth";
import { generateSlug } from "@/lib/utils/slug";

const schema = z.object({ name: z.string().trim().min(2).max(80), description: z.string().trim().max(500).optional() });
export async function POST(request: Request) {
  try {
    const admin = await requireAuth([UserRole.ADMIN]);
    const input = schema.parse(Object.fromEntries((await request.formData()).entries()));
    const slug = generateSlug(input.name);
    if (!slug) return NextResponse.json({ error: "Category name must contain letters or numbers." }, { status: 400 });
    const category = await prisma.$transaction(async (tx) => {
      const created = await tx.category.create({ data: { name: input.name, slug, description: input.description } });
      await tx.auditLog.create({ data: { actorId: admin.id, actorRole: UserRole.ADMIN, action: AuditAction.CREATE, entityType: "Category", entityId: created.id, changes: { name: created.name, slug: created.slug } } });
      return created;
    });
    return NextResponse.redirect(new URL(`/admin?category=${category.id}`, request.url), 303);
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    if (error instanceof Error && ["UNAUTHORIZED", "FORBIDDEN"].includes(error.message)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    return NextResponse.json({ error: "Unable to create category. Category names must be unique." }, { status: 409 });
  }
}
