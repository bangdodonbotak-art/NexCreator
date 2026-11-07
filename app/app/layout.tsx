import { getSetupStatus } from "@/lib/env";
import { AppShell } from "@/components/app/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const setup = getSetupStatus();
  return <AppShell setup={setup}>{children}</AppShell>;
}
