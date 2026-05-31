import { createFileRoute } from "@tanstack/react-router";
import { Users, Sparkles, Activity, AlertTriangle } from "lucide-react";
import { PageHeader, Section } from "@/components/page-header";
import { platformKpis, activity } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin — LaunchOps AI" }, { name: "description", content: "Platform overview for LaunchOps AI administrators." }] }),
  component: AdminHome,
});

const kpis = [
  { label: "Active sellers", value: (platformKpis.activeSellers || 0).toLocaleString(), icon: Users },
  { label: "Listings generated today", value: (platformKpis.listingsToday || 0).toLocaleString(), icon: Sparkles },
  { label: "Avg. inference latency", value: `${platformKpis.avgLatencyMs || 0}ms`, icon: Activity },
  { label: "Drift alerts", value: platformKpis.driftAlerts || 0, icon: AlertTriangle },
];

function AdminHome() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Admin overview" description="Platform health, model status and seller activity." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(k=>(
          <div key={k.label} className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{k.label}</span><k.icon className="h-4 w-4 text-muted-foreground"/></div>
            <div className="mt-3 font-display text-2xl font-semibold">{k.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Section title="Recent activity">
          <ul className="divide-y">
            {activity.map((a,i)=>(
              <li key={i} className="flex items-center justify-between py-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className={`h-1.5 w-1.5 rounded-full ${a.kind==="warn"?"bg-warning":a.kind==="ok"?"bg-success":"bg-muted-foreground"}`}/>
                  <span>{a.text}</span>
                </div>
                <span className="text-xs text-muted-foreground">{a.time}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}