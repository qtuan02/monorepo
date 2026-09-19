import { BootIsland } from "~/components/boot/boot-island";

/** Shown by both guards while `useSessionCheck` awaits `/auth/refresh`. */
export default function RouteGuardLoading() {
  return <BootIsland message="Checking session..." />;
}
