import { requireAuth } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
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
      phone: true,
    }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-card">
        <h1 className="text-2xl font-display font-bold text-ink-950">
          My Profile
        </h1>
        <p className="mt-1 text-ink-500">
          Manage your personal information.
        </p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-card max-w-2xl">
        <ProfileForm initialData={user} />
      </div>
    </div>
  );
}
