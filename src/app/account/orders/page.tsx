import { requireAuth } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function OrdersPage() {
  let sessionUser;
  try {
    sessionUser = await requireAuth();
  } catch {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: { customerId: sessionUser.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      totalAmount: true,
      createdAt: true,
    }
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-card">
        <h1 className="text-2xl font-display font-bold text-ink-950">
          Order History
        </h1>
        <p className="mt-1 text-ink-500">
          View and track your previous orders.
        </p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-card">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-semibold text-ink-900">No orders yet</h3>
            <p className="mt-2 text-sm text-ink-500 max-w-sm">
              When you place orders, they will appear here. Start shopping to find your next favorite outfit.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-ink-500">
              <thead className="border-b border-ink-100 bg-ink-50/50 text-xs uppercase text-ink-700">
                <tr>
                  <th className="px-4 py-3 font-medium">Order ID</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-ink-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink-900">
                      #{order.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink-900">
                      ₹{order.totalAmount.toString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
