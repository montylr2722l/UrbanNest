import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/server-auth";

export default async function CartPage() {
  let user;
  try { user = await requireAuth(); } catch { redirect("/login?callbackUrl=%2Fcart"); }
  const [cart, addresses] = await Promise.all([
    prisma.cart.findUnique({ where: { userId: user.id }, include: { items: { include: { variant: { include: { product: true } } } } } }),
    prisma.address.findMany({ where: { userId: user.id, deletedAt: null }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] }),
  ]);
  return <main className="container-main min-h-screen py-10"><h1 className="font-display text-4xl">Your cart</h1>{!cart?.items.length ? <div className="mt-6 rounded-2xl bg-white p-10 text-center"><p className="text-ink-600">Your cart is empty.</p><Link href="/catalog" className="mt-4 inline-block rounded-xl bg-ink-950 px-5 py-3 text-white">Browse catalogue</Link></div> : <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_350px]"><section className="divide-y rounded-2xl bg-white p-5 shadow-card">{cart.items.map((item) => <article key={item.id} className="flex justify-between gap-4 py-4"><div><h2 className="font-medium">{item.variant.product.name}</h2><p className="text-sm text-ink-500">{[item.variant.size, item.variant.color].filter(Boolean).join(" · ") || "Standard"} · Qty {item.quantity}</p></div><p className="font-semibold">₹{item.variant.price.times(item.quantity).toFixed(2)}</p></article>)}</section><aside className="h-fit rounded-2xl bg-white p-5 shadow-card"><h2 className="font-semibold">Delivery and payment</h2>{addresses.length === 0 ? <p className="mt-3 text-sm text-ink-600">Add a delivery address in <Link href="/account/addresses" className="underline">your account</Link> before checkout.</p> : <form action="/api/checkout" method="post" className="mt-4 space-y-4"><label className="block text-sm">Delivery address<select name="addressId" required className="mt-2 w-full rounded-lg border bg-white p-3">{addresses.map((address) => <option key={address.id} value={address.id}>{address.recipientName} — {address.line1}, {address.city} {address.pincode}</option>)}</select></label><label className="block text-sm">Payment method<select name="paymentMethod" className="mt-2 w-full rounded-lg border bg-white p-3"><option value="COD">Cash on delivery</option></select></label><p className="text-xs leading-5 text-ink-500">Prices and stock are checked again when the order is placed. COD remains unpaid until collection is recorded.</p><button className="w-full rounded-xl bg-ink-950 px-5 py-3 font-medium text-white">Place COD order</button></form>}</aside></div>}</main>;
}
