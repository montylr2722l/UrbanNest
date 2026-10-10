import { requireAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";

export default async function AddressesPage() {
  try {
    await requireAuth();
  } catch {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-card">
        <h1 className="text-2xl font-display font-bold text-ink-950">
          Saved Addresses
        </h1>
        <p className="mt-1 text-ink-500">
          Manage your shipping and billing addresses.
        </p>
      </div>

      <div className="rounded-xl bg-white p-12 shadow-card flex flex-col items-center justify-center text-center border border-dashed border-ink-200">
        <h3 className="text-lg font-semibold text-ink-900">Coming Soon</h3>
        <p className="mt-2 text-sm text-ink-500 max-w-sm">
          Address management is currently under development. You will be able to save and manage multiple addresses here soon.
        </p>
      </div>
    </div>
  );
}
