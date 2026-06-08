import PropertiesClient from "@/components/admin/properties/PropertiesClient";
import { fetchProperties } from "@/lib/actions/property-actions";

export default async function PropertiesPage() {
  const limit = 10;
  const result = await fetchProperties(1, limit, "", "createdAt", "desc");

  return (
    <PropertiesClient
      initialData={result?.data || []}
      limit={limit}
      hasMore={result?.hasMore || false}
    />
  );
}
