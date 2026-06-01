import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section, StatusBadge } from "@/components/page-header";
import { models } from "@/lib/mock-data";
import { Cpu } from "lucide-react";

export const Route = createFileRoute("/admin/models")({
  head: () => ({ meta: [{ title: "Models — Admin · LaunchOps AI" }, { name: "description", content: "Model registry across the platform." }] }),
  component: ModelsPage,
});

function ModelsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Model registry" description="All production models, versions and MLflow runs." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {models.map(m=>(
          <Section key={m.name} title={m.name} actions={<StatusBadge status={m.status==="drift"?"warn":"pass"}/>}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"><Cpu className="h-4 w-4"/></div>
              <div className="text-xs text-muted-foreground">{m.framework} · {m.version}</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <Cell k="Accuracy" v={m.accuracy?`${(m.accuracy*100).toFixed(1)}%`:"—"}/>
              <Cell k="Latency" v={`${m.latency}ms`}/>
              <Cell k="Last trained" v={m.lastTrained}/>
              <Cell k="MLflow run" v={m.run}/>
            </div>
          </Section>
        ))}
      </div>
    </div>
  );
}

function Cell({k,v}:{k:string;v:string}){return (<div className="rounded-md border bg-background p-2"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div><div className="mt-0.5 font-medium">{v}</div></div>);}