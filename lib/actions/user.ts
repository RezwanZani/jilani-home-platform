"use server";

import { cache } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Wrap the function in React's cache()
export const getCurrentUser = cache(async () => {
    const session = await auth();
    if (!session?.user?.id) return null;

    const [dbUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.user.id));

    return dbUser || null;
});