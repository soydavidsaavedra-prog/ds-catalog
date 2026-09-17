import { DSLoadingScreen } from "@/components/brand/DSLoadingScreen";

/**
 * Pins all of Super Admin (including /superadmin/login) to the plain
 * `DSLoadingScreen` — the same screen it already received from the root
 * app/loading.tsx before that one switched to the richer, marketing-only
 * `DSMarketingLoadingScreen`. Without this file, this subtree would
 * inherit that root boundary instead. Behavior here is unchanged from
 * before — this file exists to keep it that way on purpose.
 */
export default function Loading() {
  return <DSLoadingScreen />;
}
