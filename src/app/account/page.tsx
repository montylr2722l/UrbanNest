import { requireAuth } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AccountDashboardPage() {
  let sessionUser;
  try {
    sessionUser = await requireAuth();
  } catch {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      name: true,
      email: true,
      createdAt: true,
      _count: {
        select: {
          orders: true,
        }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-card">
        <h1 className="text-2xl font-display font-bold text-ink-950">
          Welcome, {user.name || "Customer"}!
        </h1>
        <p className="mt-1 text-ink-500">
          Manage your profile, track orders, and view your wishlist.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="rounded-xl bg-white p-6 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-ink-950">Profile</h3>
            <p className="mt-2 text-sm text-ink-500">{user.email}</p>
            <p className="mt-1 text-sm text-ink-400">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Link href={"/account/profile"} className="mt-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-500">
            Edit Profile &rarr;
          </Link>
        </div>

        {/* Orders Summary Card */}
        <div className="rounded-xl bg-white p-6 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-ink-950">Orders</h3>
            <p className="mt-2 text-3xl font-bold text-brand-600">
              {user._count.orders}
            </p>
            <p className="mt-1 text-sm text-ink-500">Total orders placed</p>
          </div>
          <Link href={"/account/orders"} className="mt-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-500">
            View Order History &rarr;
          </Link>
        </div>

        {/* Wishlist Placeholder Card */}
        <div className="rounded-xl bg-white p-6 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-ink-950">Wishlist</h3>
            <p className="mt-2 text-sm text-ink-500">
              Keep track of items you love.
            </p>
          </div>
          <Link href={"/account/wishlist"} className="mt-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-500">
            View Wishlist &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
