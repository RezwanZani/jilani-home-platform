import { db } from "@/lib/db";
import { pointPackages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import PricingClient from "./PricingClient";

export const metadata = {
  title: "Pricing | Jilani Home",
  description: "Simple, transparent pricing for Jilani Home",
};

export const revalidate = 60; // Revalidate every minute

export default async function PricingPage() {
  const packages = await db.query.pointPackages.findMany({
    where: eq(pointPackages.isActive, true),
    orderBy: (packages, { asc }) => [asc(packages.price)],
  });

  return <PricingClient packages={packages} />;
}
