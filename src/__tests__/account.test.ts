import { updateProfile } from "@/app/account/profile/actions";
import { requireAuth } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

jest.mock("@/lib/server-auth", () => ({
  requireAuth: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("Account Profile Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully update the profile", async () => {
    (requireAuth as jest.Mock).mockResolvedValue({ id: "user-123" });
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null); // Phone not taken
    (prisma.user.update as jest.Mock).mockResolvedValue({ id: "user-123" });

    const formData = new FormData();
    formData.append("name", "New Name");
    formData.append("phone", "1234567890");

    const result = await updateProfile(formData);

    expect(result).toEqual({ success: "Profile updated successfully." });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: { name: "New Name", phone: "1234567890" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/account");
    expect(revalidatePath).toHaveBeenCalledWith("/account/profile");
  });

  it("should prevent updating to a phone number already in use", async () => {
    (requireAuth as jest.Mock).mockResolvedValue({ id: "user-123" });
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: "user-456" }); // Phone taken

    const formData = new FormData();
    formData.append("name", "New Name");
    formData.append("phone", "1234567890");

    const result = await updateProfile(formData);

    expect(result).toEqual({ error: "Phone number is already registered to another account." });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("should return an error for invalid input", async () => {
    (requireAuth as jest.Mock).mockResolvedValue({ id: "user-123" });

    const formData = new FormData();
    formData.append("name", "N"); // Too short

    const result = await updateProfile(formData);

    expect(result.error).toContain("Name must be at least 2 characters");
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("should throw or return error if not authenticated", async () => {
    (requireAuth as jest.Mock).mockRejectedValue(new Error("UNAUTHORIZED"));

    const formData = new FormData();
    formData.append("name", "New Name");

    const result = await updateProfile(formData);

    expect(result).toEqual({ error: "An error occurred while updating your profile." });
  });
});
