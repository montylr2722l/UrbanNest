"use client";

import { useState } from "react";
import { updateProfile } from "./actions";

interface ProfileData {
  name: string | null;
  email: string;
  phone: string | null;
}

export function ProfileForm({ initialData }: { initialData: ProfileData }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result.success) {
      setMessage({ type: "success", text: result.success });
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`rounded-xl p-4 text-sm font-medium ${
            message.type === "error" ? "bg-error-50 text-error-700" : "bg-success-50 text-success-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-ink-900">
          Email address (Cannot be changed)
        </label>
        <input
          id="email"
          type="email"
          defaultValue={initialData.email}
          disabled
          className="mt-1 block w-full rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-ink-500 cursor-not-allowed"
        />
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-ink-900">
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={initialData.name || ""}
          required
          className="mt-1 block w-full rounded-xl border border-ink-200 px-4 py-3 text-ink-950 placeholder-ink-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-ink-900">
          Phone Number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={initialData.phone || ""}
          className="mt-1 block w-full rounded-xl border border-ink-200 px-4 py-3 text-ink-950 placeholder-ink-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
          placeholder="+1234567890"
        />
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex justify-center rounded-xl bg-brand-500 py-3 px-6 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
