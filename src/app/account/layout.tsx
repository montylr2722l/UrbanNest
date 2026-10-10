import { requireAuth } from "@/lib/server-auth";
import Link from "next/link";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { redirect } from "next/navigation";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAuth();
  } catch {
    redirect("/login");
  }

  const navItems = [
    { name: "Dashboard", href: "/account" },
    { name: "Profile", href: "/account/profile" },
    { name: "Orders", href: "/account/orders" },
    { name: "Addresses", href: "/account/addresses" },
    { name: "Wishlist", href: "/account/wishlist" },
  ] as const;

  return (
    <div className="min-h-screen bg-brand-50">
      {/* Top spacing / Simple header */}
      <header className="bg-white shadow-sm">
        <div className="container-main flex h-16 items-center justify-between">
          <Link href="/" className="font-display text-2xl font-bold text-brand-600">
            UrbanNest
          </Link>
          <div className="flex items-center gap-4">
            <Link href={"/account"} className="text-sm font-medium text-ink-700 hover:text-brand-600">
              My Account
            </Link>
            <LogoutButton className="text-sm font-medium text-error-600 hover:text-error-500" />
          </div>
        </div>
      </header>

      <main className="container-main py-10">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="flex flex-col space-y-1 rounded-xl bg-white p-4 shadow-card">
              <h2 className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-ink-500">
                Account Settings
              </h2>
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
