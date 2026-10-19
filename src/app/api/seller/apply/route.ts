import { NextResponse } from "next/server";
import { z } from "zod";
import { BusinessType, SellerType, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/server-auth";

const applicationSchema = z.object({
  businessName: z.string().trim().min(2).max(100),
  storeName: z.string().trim().min(2).max(100),
  sellerType: z.nativeEnum(SellerType),
  businessType: z.nativeEnum(BusinessType),
  addressLine1: z.string().trim().min(4).max(160),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  pincode: z.string().regex(/^\d{6}$/),
  phone: z.string().regex(/^[6-9]\d{9}$/),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const form = await request.formData();
    const input = applicationSchema.parse(Object.fromEntries(form.entries()));
    const existing = await prisma.sellerProfile.findUnique({ where: { userId: user.id } });
    if (existing) return NextResponse.json({ error: "A seller application already exists." }, { status: 409 });
    const slugBase = input.storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const slug = `${slugBase}-${user.id.slice(-6).toLowerCase()}`;
    await prisma.$transaction(async (tx) => {
      await tx.sellerProfile.create({ data: {
        userId: user.id,
        businessName: input.businessName,
        businessType: input.businessType,
        sellerType: input.sellerType,
        onboardingStatus: "PROFILE_SUBMITTED",
        addressLine1: input.addressLine1,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        stores: { create: { name: input.storeName, slug, phone: input.phone, addressLine1: input.addressLine1, city: input.city, state: input.state, pincode: input.pincode, isActive: false } },
      } });
      await tx.user.update({ where: { id: user.id }, data: { role: UserRole.SELLER, phone: input.phone } });
    });
    return NextResponse.json({ message: "Application submitted for review." }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Please check the application fields." }, { status: 400 });
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "Sign in to apply." }, { status: 401 });
    return NextResponse.json({ error: "Unable to submit application." }, { status: 500 });
  }
}
