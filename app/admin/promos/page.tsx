import PromosClient from "@/components/admin/promos/PromosClient";
import { fetchPromoCodes } from "@/lib/actions/promo-actions";

export default async function PromosPage() {
  const promos = await fetchPromoCodes(1, 10);
  return <PromosClient initialData={promos.data} hasMore={promos.hasMore} limit={10} />;
}
