import { POST as registerPost } from "@/app/api/auth/register/route";
import { requireAuth } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// Mock dependencies
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
  compare: jest.fn(),
}));

jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

describe("Authentication & Authorization Phase 1", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Registration API", () => {
    it("should successfully register a CUSTOMER and enforce strong passwords", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: "1",
        email: "test@test.com",
        name: "Test User",
        role: "CUSTOMER",
      });

      const req = new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: "test@test.com",
          name: "Test User",
          password: "StrongPassword1", // valid
        }),
      });

      const res = await registerPost(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.user.role).toBe("CUSTOMER");
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: "CUSTOMER",
            passwordHash: "hashed_password",
          }),
        })
      );
    });

    it("should prevent privilege escalation by enforcing CUSTOMER role", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: "2",
        email: "hacker@test.com",
        role: "CUSTOMER",
      });

      const req = new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: "hacker@test.com",
          password: "StrongPassword1",
          role: "ADMIN", // Injection attempt
        }),
      });

      const res = await registerPost(req);
      expect(res.status).toBe(201);

      // Verification that the mock received 'CUSTOMER' despite input
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: "CUSTOMER",
          }),
        })
      );
    });

    it("should block duplicate email registration", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "1" });

      const req = new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: "exists@test.com",
          password: "StrongPassword1",
        }),
      });

      const res = await registerPost(req);
      expect(res.status).toBe(409);
    });
  });

  describe("Server Authorization Utility (requireAuth)", () => {
    it("should throw UNAUTHORIZED if no session exists", async () => {
      (auth as jest.Mock).mockResolvedValue(null);
      await expect(requireAuth()).rejects.toThrow("UNAUTHORIZED");
    });

    it("should throw FORBIDDEN if the user account is inactive", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: "1" } });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "1",
        isActive: false, // Inactive
        deletedAt: null,
      });

      await expect(requireAuth()).rejects.toThrow("FORBIDDEN");
    });

    it("should throw FORBIDDEN if the user account is soft-deleted", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: "1" } });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "1",
        isActive: true,
        deletedAt: new Date(), // Soft deleted
      });

      await expect(requireAuth()).rejects.toThrow("FORBIDDEN");
    });

    it("should throw FORBIDDEN if the user lacks the required role", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: "1" } });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "1",
        isActive: true,
        deletedAt: null,
        role: "CUSTOMER", // Not admin
      });

      await expect(requireAuth(["ADMIN"])).rejects.toThrow("FORBIDDEN");
    });

    it("should return the user record if all authorization checks pass", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: "1" } });
      const mockUser = {
        id: "1",
        isActive: true,
        deletedAt: null,
        role: "ADMIN",
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await requireAuth(["ADMIN"]);
      expect(result).toEqual(mockUser);
    });
  });
});
