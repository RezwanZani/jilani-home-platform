import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import StoreClient from "@/components/dashboard/store/StoreClient";
import { db } from "@/lib/db";
import { pointPackages } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const metadata = {
  title: "Get Points - Jilani Home",
};

export default async function StorePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const packages = await db
    .select()
    .from(pointPackages)
    .where(eq(pointPackages.isActive, true))
    .orderBy(desc(pointPackages.isPopular), desc(pointPackages.price));

  return <StoreClient packages={packages} user={session.user} />;
}
