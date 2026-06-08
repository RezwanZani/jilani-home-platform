import { SavedPropertyList } from "@/components/dashboard/saved/SavedPropertyList";
import { getSavedProperties } from "@/lib/actions/save-actions";
import { SavedProperty } from "@/components/dashboard/saved/SavedPropertyList";

export const dynamic = 'force-dynamic';

export default async function UserSavedPage() {
  const { data } = await getSavedProperties();
  // Being a Server Component, you can safely fetch database data here in the future
  return (
    <main className="w-full pb-20">
      <SavedPropertyList initialItems={data as SavedProperty[]} />
    </main>
  );
}
