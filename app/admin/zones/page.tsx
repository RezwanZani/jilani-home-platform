import ZonesClient from "@/components/admin/zones/ZonesClient";
import { fetchZones } from "@/lib/actions/zone-actions";

export default async function ZonesPage() {

  const zones = await fetchZones(1, 10);
  return <ZonesClient initialData={zones.data} hasMore={zones.hasMore} limit={10} />;
}
