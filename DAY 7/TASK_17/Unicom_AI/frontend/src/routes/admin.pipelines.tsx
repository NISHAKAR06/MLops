import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

const pipelineSteps = [
  { title: "User Input", desc: "Image · Video · Voice · Text" },
  { title: "Multimodal Processing", desc: "OCR · ASR · Vision tokenizers" },
  { title: "AI Product Understanding", desc: "Embeddings + brand detection" },
  { title: "Categorization", desc: "BERT classifier (3-level taxonomy)" },
  { title: "Title & Description", desc: "LLM (Llama / Gemini)" },
  { title: "Pricing", desc: "Competitor scrape + elasticity model" },
  { title: "Packaging", desc: "Template engine + dieline render" },
  { title: "Compliance", desc: "Rule engine + marketplace policies" },
  { title: "Marketplace-Ready Output", desc: "Amazon · Flipkart · Meesho" },
  { title: "Monitoring & MLOps", desc: "MLflow · Prometheus · Drift" },
];

export const Route = createFileRoute("/admin/pipelines")({
  head: () => ({ meta: [{ title: "Pipelines — Admin · LaunchOps AI" }, { name: "description", content: "Workflow and CI/CD pipelines." }] }),
  component: PipelinesPage,
});

function PipelinesPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Pipelines" description="Multimodal workflow and CI/CD status across the platform." />
      <Section title="Multimodal workflow">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          {pipelineSteps.map((s,i)=>(
            <div key={s.title} className="rounded-lg border bg-card p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground">{i+1}</div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground"/>
              </div>
              <div className="text-sm font-medium">{s.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.desc}</div>
            </div>
          ))}
        </div>
      </Section>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Section title="CI/CD">
          <div className="space-y-2 text-sm">
            {[["GitHub Actions","deploy/prod #482"],["DVC pipeline","data/v0.31"],["Docker build","images:multi-arch"],["Kubernetes rollout","unicom-api · 6/6"],["MLflow","run mlf-9af23"]].map(([k,v])=>(
              <div key={k} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div><div className="font-medium">{k}</div><div className="text-xs text-muted-foreground">{v}</div></div>
                <Badge variant="outline" className="border-success/30 bg-success/10 text-success">ok</Badge>
              </div>
            ))}
          </div>
        </Section>
        <Section title="Observability stack">
          <div className="grid grid-cols-2 gap-2 text-sm">
            {["Prometheus","Grafana","MLflow","DVC","Sentry","GitHub Actions"].map(t=>(
              <div key={t} className="rounded-md border bg-background p-3"><div className="font-medium">{t}</div><div className="text-xs text-muted-foreground">Connected</div></div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}