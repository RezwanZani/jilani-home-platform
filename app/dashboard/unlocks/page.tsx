import { UnlockedPropertyList } from "@/components/dashboard/unlocks/UnlockedPropertyList";
import { getUnlockedProperties } from "@/lib/actions/unlock-actions";
import { UnlockedProperty } from "@/components/dashboard/unlocks/UnlockedPropertyList";

export const dynamic = 'force-dynamic';

export default async function UserUnlocksPage() {
  const { data, hasMore } = await getUnlockedProperties(1, 10);

  return (
    <main className="w-full pb-20 pt-4">
      <UnlockedPropertyList initialItems={data as UnlockedProperty[]} initialHasMore={hasMore || false} />
    </main>
  );
}
