import TransactionsClient from "@/components/admin/transactions/TransactionsClient";
import { fetchTransactions } from "@/lib/actions/transaction-actions";
import { db } from "@/lib/db";
import { pointPackages, promoCodes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function TransactionsPage() {
  const transactions = await fetchTransactions(1, 10);
  const packages = await db.select().from(pointPackages).where(eq(pointPackages.isActive, true));
  const promos = await db.select().from(promoCodes).where(eq(promoCodes.isActive, true));

  return <TransactionsClient initialData={transactions.data} hasMore={transactions.hasMore} limit={10} packages={packages} promos={promos} />;
}
