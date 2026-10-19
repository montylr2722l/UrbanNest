import Link from "next/link";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/server-auth";

export default async function SellerPage() {
  let user;
  try { user = await requireAuth(); } catch { redirect("/login"); }
  if (user.role === UserRole.ADMIN) redirect("/admin");
  if (user.role !== UserRole.SELLER) return <ApplyForm />;
  const profile = await prisma.sellerProfile.findUnique({ where: { userId: user.id }, include: { stores: true } });
  if (!profile) return <ApplyForm />;
  if (!profile.isActive || profile.isSuspended) {
    const title = profile.isSuspended ? "Seller account suspended" : profile.onboardingStatus === "PROFILE_SUBMITTED" ? "Application under review" : "Application needs correction";
    const message = profile.isSuspended ? "Your seller access is suspended. Contact UrbanNest support for assistance." : profile.onboardingStatus === "PROFILE_SUBMITTED" ? "Your store cannot list products until an administrator approves it." : "Your application was returned for correction. Contact UrbanNest support to continue.";
    return <main className="container-main py-16"><h1 className="font-display text-3xl">{title}</h1><p className="mt-3 text-ink-600">{message}</p></main>;
  }
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where: { sellerId: profile.id }, include: { variants: { include: { inventory: true } } }, orderBy: { updatedAt: "desc" } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { displayOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  return <main className="container-main space-y-8 py-10">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-brand-700">Seller workspace</p><h1 className="font-display text-3xl">{profile.businessName}</h1></div><Link href="/seller/orders" className="rounded-full border px-4 py-2 text-sm">Seller orders</Link></header>
    <section className="rounded-2xl bg-white p-6 shadow-card"><h2 className="text-xl font-semibold">Add a product</h2><p className="mt-1 text-sm text-ink-500">New products start in draft and are not visible to customers until approved.</p>
      <form action="/api/seller/products" method="post" className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">Name<input name="name" required minLength={3} maxLength={120} className="mt-1 w-full rounded-lg border p-3" /></label>
        <label className="text-sm">Category<select name="categoryId" required className="mt-1 w-full rounded-lg border bg-white p-3"><option value="">Choose category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label className="text-sm">Description<textarea name="description" maxLength={4000} className="mt-1 w-full rounded-lg border p-3" /></label>
        <label className="text-sm">SKU<input name="sku" required maxLength={64} className="mt-1 w-full rounded-lg border p-3" /></label>
        <label className="text-sm">Price (INR)<input name="price" required inputMode="decimal" pattern="[0-9]+(\\.[0-9]{1,2})?" className="mt-1 w-full rounded-lg border p-3" /></label>
        <label className="text-sm">Available quantity<input name="quantity" type="number" min="0" max="100000" required className="mt-1 w-full rounded-lg border p-3" /></label>
        <label className="text-sm">Size (optional)<input name="size" maxLength={24} className="mt-1 w-full rounded-lg border p-3" /></label>
        <label className="text-sm">Colour (optional)<input name="color" maxLength={40} className="mt-1 w-full rounded-lg border p-3" /></label>
        <button className="rounded-xl bg-ink-950 px-5 py-3 font-medium text-white sm:col-span-2">Save draft</button>
      </form>
    </section>
    <section className="rounded-2xl bg-white p-6 shadow-card"><h2 className="text-xl font-semibold">Your products</h2>{products.length === 0 ? <p className="mt-4 text-ink-500">No products yet.</p> : <ul className="mt-4 divide-y">{products.map((product) => <li key={product.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><span>{product.name}</span><span className="text-sm text-ink-500">{product.status} · {product.variants.reduce((sum, variant) => sum + variant.inventory.reduce((count, stock) => count + stock.quantity - stock.reservedQuantity, 0), 0)} in stock</span><div className="flex gap-2">{product.status === "DRAFT" && <form action={`/api/seller/products/${product.id}/status`} method="post"><input type="hidden" name="action" value="submit"/><button className="rounded-md border px-3 py-1 text-xs">Submit for review</button></form>}{product.status === "PUBLISHED" && <form action={`/api/seller/products/${product.id}/status`} method="post"><input type="hidden" name="action" value="pause"/><button className="rounded-md border px-3 py-1 text-xs">Pause listing</button></form>}{["DRAFT", "PUBLISHED", "PAUSED"].includes(product.status) && <form action={`/api/seller/products/${product.id}/status`} method="post"><input type="hidden" name="action" value="archive"/><button className="rounded-md border px-3 py-1 text-xs">Archive</button></form>}</div></li>)}</ul>}</section>
  </main>;
}

function ApplyForm() {
  return <main className="container-main max-w-3xl py-12"><h1 className="font-display text-4xl">Open a shop on UrbanNest</h1><p className="mt-3 text-ink-600">Submit your shop details for administrator review.</p><form action="/api/seller/apply" method="post" className="mt-8 grid gap-4 rounded-2xl bg-white p-6 shadow-card sm:grid-cols-2">
    <label className="text-sm">Business name<input name="businessName" required minLength={2} className="mt-1 w-full rounded-lg border p-3" /></label><label className="text-sm">Store name<input name="storeName" required minLength={2} className="mt-1 w-full rounded-lg border p-3" /></label>
    <label className="text-sm">Seller type<select name="sellerType" className="mt-1 w-full rounded-lg border bg-white p-3"><option value="LOCAL_STORE">Local shop</option><option value="ONLINE_SELLER">Online seller</option><option value="BRAND">Brand</option></select></label><label className="text-sm">Business structure<select name="businessType" className="mt-1 w-full rounded-lg border bg-white p-3"><option value="INDIVIDUAL">Individual</option><option value="SOLE_PROPRIETORSHIP">Sole proprietorship</option><option value="PARTNERSHIP">Partnership</option><option value="PRIVATE_LIMITED">Private limited</option><option value="LLP">LLP</option><option value="OTHER">Other</option></select></label>
    <label className="text-sm sm:col-span-2">Shop address<input name="addressLine1" required minLength={4} className="mt-1 w-full rounded-lg border p-3" /></label><label className="text-sm">City<input name="city" required className="mt-1 w-full rounded-lg border p-3" /></label><label className="text-sm">State<input name="state" required className="mt-1 w-full rounded-lg border p-3" /></label><label className="text-sm">PIN code<input name="pincode" required pattern="[0-9]{6}" className="mt-1 w-full rounded-lg border p-3" /></label><label className="text-sm">Mobile number<input name="phone" required pattern="[6-9][0-9]{9}" className="mt-1 w-full rounded-lg border p-3" /></label><button className="rounded-xl bg-ink-950 px-5 py-3 font-medium text-white sm:col-span-2">Submit for review</button>
  </form></main>;
}
