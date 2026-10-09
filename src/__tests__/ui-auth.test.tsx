/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "@/app/register/page";
import LoginPage from "@/app/login/page";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock next-auth/react
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

describe("Authentication UI", () => {
  const mockPush = jest.fn();
  const mockRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockImplementation((key) => {
        if (key === "callbackUrl") return "/account";
        if (key === "registered") return null;
        return null;
      }),
    });

    // Polyfill fetch for the register test
    global.fetch = jest.fn();
  });

  describe("RegisterPage", () => {
    it("should display validation errors if fields are invalid", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      // Submit empty form
      const submitButton = screen.getByRole("button", { name: /create account/i });
      await user.click(submitButton);

      expect(await screen.findByText(/Invalid email address/i)).toBeInTheDocument();
      expect(await screen.findByText(/Password must/i)).toBeInTheDocument();
    });

    it("should display password mismatch error", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      await user.type(screen.getByLabelText(/Full Name/i), "Test User");
      await user.type(screen.getByLabelText(/Email address/i), "test@example.com");
      await user.type(screen.getByLabelText(/^Password/i), "ValidPass1");
      await user.type(screen.getByLabelText(/Confirm Password/i), "ValidPass2");

      const submitButton = screen.getByRole("button", { name: /create account/i });
      await user.click(submitButton);

      expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
    });

    it("should submit the form and redirect on success", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { id: "1" } }),
      });

      const user = userEvent.setup();
      render(<RegisterPage />);

      await user.type(screen.getByLabelText(/Full Name/i), "Test User");
      await user.type(screen.getByLabelText(/Email address/i), "test@example.com");
      await user.type(screen.getByLabelText(/^Password/i), "ValidPass1");
      await user.type(screen.getByLabelText(/Confirm Password/i), "ValidPass1");

      const submitButton = screen.getByRole("button", { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/auth/register", expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            name: "Test User",
            email: "test@example.com",
            password: "ValidPass1",
          }),
        }));
        expect(mockPush).toHaveBeenCalledWith("/login?registered=true");
      });
    });
  });

  describe("LoginPage", () => {
    it("should call signIn and redirect on successful login", async () => {
      (signIn as jest.Mock).mockResolvedValueOnce({ ok: true, error: null });

      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText(/Email address/i), "test@example.com");
      await user.type(screen.getByLabelText(/Password/i), "ValidPass1");

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith("credentials", {
          redirect: false,
          email: "test@example.com",
          password: "ValidPass1",
        });
        expect(mockPush).toHaveBeenCalledWith("/account"); // default callbackUrl
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it("should display an error message on invalid credentials", async () => {
      (signIn as jest.Mock).mockResolvedValueOnce({ ok: false, error: "CredentialsSignin" });

      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText(/Email address/i), "test@example.com");
      await user.type(screen.getByLabelText(/Password/i), "WrongPass");

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      expect(await screen.findByText(/Invalid email or password/i)).toBeInTheDocument();
    });
  });
});
