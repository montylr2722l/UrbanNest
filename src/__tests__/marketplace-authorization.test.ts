import { requireMarketplaceRole } from "@/lib/marketplace/authorization";
import { requireAuth } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/server-auth", () => ({ requireAuth: jest.fn() }));
jest.mock("@/lib/prisma", () => ({ prisma: { sellerProfile: { findUnique: jest.fn() } } }));

describe("seller workspace authorization", () => {
  beforeEach(() => jest.clearAllMocks());

  it("requires a seller role before checking a seller profile", async () => {
    (requireAuth as jest.Mock).mockRejectedValue(new Error("FORBIDDEN"));
    await expect(requireMarketplaceRole("SELLER")).rejects.toThrow("FORBIDDEN");
    expect(requireAuth).toHaveBeenCalledWith(["SELLER"]);
    expect(prisma.sellerProfile.findUnique).not.toHaveBeenCalled();
  });

  it("denies seller accounts without an approved profile", async () => {
    (requireAuth as jest.Mock).mockResolvedValue({ id: "seller-user", role: "SELLER" });
    (prisma.sellerProfile.findUnique as jest.Mock).mockResolvedValue({ isActive: false, isSuspended: false });
    await expect(requireMarketplaceRole("SELLER")).rejects.toThrow("SELLER_NOT_APPROVED");
  });

  it("denies suspended sellers and permits approved active sellers", async () => {
    (requireAuth as jest.Mock).mockResolvedValue({ id: "seller-user", role: "SELLER" });
    (prisma.sellerProfile.findUnique as jest.Mock).mockResolvedValueOnce({ isActive: true, isSuspended: true });
    await expect(requireMarketplaceRole("SELLER")).rejects.toThrow("SELLER_NOT_APPROVED");
    (prisma.sellerProfile.findUnique as jest.Mock).mockResolvedValueOnce({ isActive: true, isSuspended: false });
    await expect(requireMarketplaceRole("SELLER")).resolves.toMatchObject({ id: "seller-user" });
  });
});
