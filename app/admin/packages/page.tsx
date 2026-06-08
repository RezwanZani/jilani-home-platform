import PackagesClient from "@/components/admin/packages/PackagesClient";
import { fetchPackages } from "@/lib/actions/package-actions";

export default async function PackagesPage() {
  const packages = await fetchPackages(1, 10);
  return <PackagesClient initialData={packages.data} hasMore={packages.hasMore} limit={10} />;
}
