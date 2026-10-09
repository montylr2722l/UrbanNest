"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

interface LogoutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  callbackUrl?: string;
  children?: React.ReactNode;
}

export function LogoutButton({ callbackUrl = "/login", children = "Sign out", className, ...props }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await signOut({ callbackUrl });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={className || "text-sm font-semibold text-error-600 hover:text-error-500 disabled:opacity-50 transition-colors"}
      {...props}
    >
      {loading ? "Signing out..." : children}
    </button>
  );
}
