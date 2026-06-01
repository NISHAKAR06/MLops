import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    const a = getAuth();
    if (!a.authed) throw redirect({ to: "/login" });
    if (a.role !== "admin") throw redirect({ to: "/" });
  },
  component: () => <Outlet />,
});