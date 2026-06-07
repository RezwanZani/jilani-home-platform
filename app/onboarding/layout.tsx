import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    // 1. Ensure they are logged in
    if (!session?.user?.id) {
        redirect("/login");
    }

    // 2. Query the absolute truth from the database
    const [dbUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.user.id));

    // 3. Use the Ghost Session handler we built earlier!
    if (!dbUser) {
        redirect("/logout");
    }

    // 4. If they already have a phone number, kick them to Dashboard
    if (dbUser.phoneNumber) {
        redirect("/dashboard");
    }

    // Only render the onboarding page if they TRULY have no phone number
    return <>{children}</>;
}