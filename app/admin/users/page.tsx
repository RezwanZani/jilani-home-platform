import UsersClient from "@/components/admin/users/UsersClient";
import { fetchUsers } from "@/lib/actions/user-actions";

export default async function UsersPage() {
  const limit = 10;
  // Initial fetch: page 1, limit 10, no search, sort by createdAt desc
  const result = await fetchUsers(1, limit, "", "createdAt", "desc");

  return (
    <UsersClient
      initialData={result?.data || []}
      limit={limit}
      hasMore={result?.hasMore || false}
    />
  );
}
