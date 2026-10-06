import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ShellSkeleton } from "@/components/app-shell";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <ShellSkeleton />;
  if (user) return <Navigate to="/dashboard" />;
  return <Navigate to="/login" />;
}
