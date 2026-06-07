import { Metadata } from "next";
import { fetchUserTransactions } from "@/lib/actions/transaction-actions";
import { UserTransactionsClient } from "@/components/dashboard/transactions/UserTransactionsClient";

export const metadata: Metadata = {
  title: "Your Transactions | NeoSparkX",
  description: "View your points and payment history.",
};

export default async function UserTransactionsPage() {
  const initialData = await fetchUserTransactions(1, 10);

  return <UserTransactionsClient initialData={initialData} />;
}
