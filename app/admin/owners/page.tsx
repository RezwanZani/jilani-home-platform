import OwnersClient from "@/components/admin/owners/OwnersClient";
import { fetchOwners } from "@/lib/actions/owner-actions";

export default async function OwnersPage() {
  // Fetch initial data (page 1, limit 10)
  const limit = 10;
  const result = await fetchOwners(1, limit, "", "updatedAt", "desc");

  return (
    <OwnersClient
      initialData={result?.data || []} // <-- Make sure fallback is here too
      limit={limit}
      hasMore={result?.hasMore || false}
    />
  );
}