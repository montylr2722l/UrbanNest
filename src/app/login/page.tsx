"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";
  const registered = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Must use the credentials provider
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
      } else if (res?.ok) {
        // Prevent open redirect by ensuring it's a relative path
        if (callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          router.push(callbackUrl as any);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          router.push("/account" as any);
        }
        router.refresh(); // Force a refresh to ensure server components update with the new session
      }
    } catch {
      setError("An unexpected network error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-4xl shadow-card">
        <div>
          <h1 className="mt-2 text-center font-display text-4xl tracking-tight text-ink-950">
            Welcome back
          </h1>
          <p className="mt-3 text-center text-sm text-ink-500">
            Sign in to your UrbanNest account
          </p>
        </div>

        {registered && (
          <div className="rounded-xl bg-success-50 p-4 text-sm font-medium text-success-700 animate-fade-in" role="alert">
            Registration successful! Please sign in.
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-error-50 p-4 text-sm font-medium text-error-700 animate-fade-in" role="alert">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-900">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full rounded-xl border border-ink-200 px-4 py-3 text-ink-950 placeholder-ink-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-900">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full rounded-xl border border-ink-200 px-4 py-3 text-ink-950 placeholder-ink-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-xl bg-brand-500 py-3.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <span className="text-ink-500">Don&apos;t have an account? </span>
          <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-500 transition-colors">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-brand-50 text-ink-500">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
