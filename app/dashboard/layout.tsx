import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { UserProvider } from "@/components/providers/UserProvider";

export default async function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id));

  // 🚨 CRITICAL FIX: The Ghost Session Handler
  if (!dbUser) {
    // Redirect to our client-side logout handler to safely clear the cookies
    redirect("/logout");
  }

  // Normal flow
  if (!dbUser.phoneNumber) {
    redirect("/onboarding");
  }

  return (
    <UserProvider user={dbUser}>
      <DashboardLayout>{children}</DashboardLayout>
    </UserProvider>
  );
}
