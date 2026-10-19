import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireMarketplaceRole } from "@/lib/marketplace/authorization";

export default async function SellerOrdersPage() {
  let user;
  try { user = await requireMarketplaceRole("SELLER"); } catch { redirect("/seller"); }
  const profile = await prisma.sellerProfile.findUnique({ where: { userId: user.id }, select: { id: true } });
  const orders = await prisma.sellerOrder.findMany({ where: { sellerId: profile?.id }, include: { order: { select: { createdAt: true, paymentMethod: true, paymentStatus: true, shippingAddressSnapshot: true } }, items: true }, orderBy: { createdAt: "desc" } });
  const next: Partial<Record<string, string>> = { PENDING: "ACCEPTED", ACCEPTED: "PROCESSING", PROCESSING: "SHIPPED", SHIPPED: "OUT_FOR_DELIVERY", OUT_FOR_DELIVERY: "DELIVERED" };
  return <main className="container-main min-h-screen py-10"><h1 className="font-display text-4xl">Seller orders</h1>{orders.length === 0 ? <p className="mt-5 rounded-xl bg-white p-8 text-ink-500">No seller orders yet.</p> : <div className="mt-6 space-y-4">{orders.map((order) => <article key={order.id} className="rounded-xl bg-white p-5 shadow-card"><div className="flex flex-wrap justify-between gap-2"><h2 className="font-semibold">Order #{order.orderId.slice(-8).toUpperCase()}</h2><span className="text-sm">{order.status.replaceAll("_", " ")}</span></div><p className="mt-1 text-sm text-ink-500">{order.order.createdAt.toLocaleDateString()} · {order.order.paymentMethod ?? "Unspecified"} · Payment {order.order.paymentStatus.replaceAll("_", " ")}</p><ul className="mt-3 space-y-1 text-sm">{order.items.map((item) => <li key={item.id}>{item.quantity} × {item.productNameSnapshot} — ₹{item.totalPrice.toFixed(2)}</li>)}</ul>{next[order.status] && <form action={`/api/seller/orders/${order.id}/status`} method="post" className="mt-4"><input type="hidden" name="status" value={next[order.status]}/><button className="rounded-lg bg-ink-950 px-4 py-2 text-sm text-white">Mark {next[order.status]?.replaceAll("_", " ")}</button></form>}</article>)}</div>}</main>;
}
