import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/server-auth";

const schema = z.object({ recipientName: z.string().trim().min(2).max(100), phone: z.string().regex(/^[6-9]\d{9}$/), line1: z.string().trim().min(4).max(160), line2: z.string().trim().max(160).optional(), city: z.string().trim().min(2).max(80), state: z.string().trim().min(2).max(80), pincode: z.string().regex(/^\d{6}$/) });
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const form = await request.formData();
    const input = schema.parse(Object.fromEntries(form.entries()));
    const existing = await prisma.address.count({ where: { userId: user.id, deletedAt: null } });
    await prisma.address.create({ data: { ...input, userId: user.id, isDefault: existing === 0 } });
    return NextResponse.redirect(new URL("/account/addresses", request.url), 303);
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Please enter valid address details." }, { status: 400 });
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.redirect(new URL("/login", request.url), 303);
    return NextResponse.json({ error: "Unable to save address." }, { status: 500 });
  }
}
