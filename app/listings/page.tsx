import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import ListingsClient from "@/components/listings/ListingClient";

export default async function ListingsPage() {
  // 1. Fetch Session & Balance securely on the server
  const session = await auth();
  const isLoggedIn = !!session?.user?.id;

  let userBalance = 0;
  if (isLoggedIn) {
    const userDb = await db.select({ pointsBalance: users.pointsBalance })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);
    if (userDb.length > 0) userBalance = userDb[0].pointsBalance;
  }

  // 2. Pass the secure data down to the interactive client component
  return (
    <ListingsClient
      isLoggedIn={isLoggedIn}
      userBalance={userBalance}
    />
  );
}
