"use server";

import { requireAuth } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  phone: z.string().max(20).optional().nullable(),
});

export async function updateProfile(formData: FormData) {
  try {
    const sessionUser = await requireAuth();

    const data = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string || null,
    };

    const parsed = profileSchema.safeParse(data);

    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message || "Validation failed" };
    }

    // Check if phone is already taken by another user
    if (parsed.data.phone) {
      const existingPhone = await prisma.user.findFirst({
        where: {
          phone: parsed.data.phone,
          id: { not: sessionUser.id }
        }
      });
      if (existingPhone) {
        return { error: "Phone number is already registered to another account." };
      }
    }

    await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        // STRICT SECURITY: We never update role, email, passwordHash, or isActive here.
      },
    });

    revalidatePath("/account");
    revalidatePath("/account/profile");

    return { success: "Profile updated successfully." };
  } catch (err) {
    console.error("Profile update error:", err);
    return { error: "An error occurred while updating your profile." };
  }
}
