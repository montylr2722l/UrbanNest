import { requireAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AddressesPage() {
  let user;
  try {
    user = await requireAuth();
  } catch {
    redirect("/login");
  }

  const addresses = await prisma.address.findMany({ where: { userId: user.id, deletedAt: null }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] });
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

      <div className="grid gap-5 lg:grid-cols-2">
        <form action="/api/account/addresses" method="post" className="grid gap-3 rounded-xl bg-white p-6 shadow-card sm:grid-cols-2">
          <label className="text-sm">Recipient<input name="recipientName" required className="mt-1 w-full rounded-lg border p-3" /></label>
          <label className="text-sm">Mobile<input name="phone" required pattern="[6-9][0-9]{9}" className="mt-1 w-full rounded-lg border p-3" /></label>
          <label className="text-sm sm:col-span-2">Address line<input name="line1" required minLength={4} className="mt-1 w-full rounded-lg border p-3" /></label>
          <label className="text-sm sm:col-span-2">Apartment / landmark<input name="line2" className="mt-1 w-full rounded-lg border p-3" /></label>
          <label className="text-sm">City<input name="city" required className="mt-1 w-full rounded-lg border p-3" /></label>
          <label className="text-sm">State<input name="state" required className="mt-1 w-full rounded-lg border p-3" /></label>
          <label className="text-sm">PIN code<input name="pincode" required pattern="[0-9]{6}" className="mt-1 w-full rounded-lg border p-3" /></label>
          <button className="self-end rounded-lg bg-ink-950 px-4 py-3 text-sm text-white">Save address</button>
        </form>
        <div className="space-y-3">{addresses.length === 0 ? <p className="rounded-xl border border-dashed bg-white p-8 text-center text-sm text-ink-500">No saved addresses yet.</p> : addresses.map((address) => <article key={address.id} className="rounded-xl bg-white p-5 shadow-card"><div className="flex justify-between"><h2 className="font-semibold">{address.recipientName}</h2>{address.isDefault && <span className="text-xs text-brand-700">Default</span>}</div><p className="mt-2 text-sm text-ink-600">{address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.pincode}</p><p className="mt-1 text-sm text-ink-500">{address.phone}</p></article>)}</div>
      </div>
    </div>
  );
}
