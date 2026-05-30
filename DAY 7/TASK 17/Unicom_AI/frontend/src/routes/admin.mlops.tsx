import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageHeader, Section } from "@/components/page-header";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis, YAxis, ReferenceLine } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Activity, Cpu, Gauge, Server, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/admin/mlops")({
  head: () => ({
    meta: [
      { title: "MLOps — Admin · LaunchOps AI" },
      { name: "description", content: "Real-time model monitoring, drift detection and retraining." },
    ],
  }),
  component: MlopsPage,
});

type LiveMetric = { t: string; v: number };

const mlopsSeries = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, "0")}:00`,
  accuracy: 0.9 + Math.sin(i / 3) * 0.025 + 0.01,
  latency: 180 + Math.cos(i / 4) * 40 + (i > 18 ? 60 : 0),
  drift: 0.02 + (i > 16 ? 0.04 : 0) + Math.sin(i / 5) * 0.01,
  throughput: 220 + Math.sin(i / 2) * 60 + i * 4,
}));

function useLiveSeries(initial: number, jitter: number, points = 30, intervalMs = 1500): LiveMetric[] {
  const [series, setSeries] = useState<LiveMetric[]>(() =>
    Array.from({ length: points }, (_, i) => ({
      t: `${points - i}s`,
      v: Math.max(0, initial + (Math.random() - 0.5) * jitter),
    })),
  );
  const ref = useRef(initial);
  useEffect(() => {
    const id = setInterval(() => {
      ref.current = Math.max(0, ref.current + (Math.random() - 0.5) * jitter);
      setSeries((prev) => {
        const next = [...prev.slice(1), { t: "now", v: ref.current }];
        return next.map((p, i) => ({ ...p, t: i === next.length - 1 ? "now" : `${next.length - i}s` }));
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [jitter, intervalMs]);
  return series;
}

function MlopsPage() {
  const [modelsList, setModelsList] = useState<any[]>([]);
  const [activityList, setActivityList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8000/api/admin/models").then((res) => res.json()),
      fetch("http://localhost:8000/api/admin/activity").then((res) => res.json())
    ])
      .then(([modelsData, activityData]) => {
        setModelsList(modelsData);
        setActivityList(activityData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);
  const latency = useLiveSeries(220, 60);
  const throughput = useLiveSeries(420, 80);
  const errors = useLiveSeries(0.6, 0.4);
  const gpu = useLiveSeries(62, 18);

  const last = (s: LiveMetric[]) => s[s.length - 1]?.v ?? 0;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="MLOps monitoring"
        description="Prometheus + Grafana style real-time observability across the model fleet."
        actions={
          <Badge variant="outline" className="gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            Live · scrape 15s
          </Badge>
        }
      />

      {/* Real-time KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <LiveStat icon={Zap} label="Inference latency p95" value={`${Math.round(last(latency))} ms`} hint="budget 800ms" series={latency} color="var(--chart-4)" />
        <LiveStat icon={Activity} label="Throughput" value={`${Math.round(last(throughput))} req/min`} hint="rolling 1m" series={throughput} color="var(--chart-2)" />
        <LiveStat icon={AlertTriangle} label="Error rate" value={`${last(errors).toFixed(2)}%`} hint="5xx + model errors" series={errors} color="var(--chart-5)" />
        <LiveStat icon={Cpu} label="GPU utilization" value={`${Math.round(last(gpu))}%`} hint="T4 pool · 8 nodes" series={gpu} color="var(--chart-1)" />
      </div>

      {/* PromQL panel + service health */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Section
          title="Latency p95 — last 24h"
          description="histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
          actions={<Badge variant="outline" className="font-mono text-[10px]">PromQL</Badge>}
        >
          <ChartContainer config={{ latency: { label: "Latency", color: "var(--chart-4)" } }} className="h-[240px] w-full">
            <AreaChart data={mlopsSeries}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ReferenceLine y={300} stroke="var(--chart-5)" strokeDasharray="4 4" label={{ value: "SLO 300ms", position: "right", fontSize: 10, fill: "var(--chart-5)" }} />
              <Area dataKey="latency" stroke="var(--color-latency)" fill="var(--color-latency)" fillOpacity={0.18} type="monotone" />
            </AreaChart>
          </ChartContainer>
        </Section>

        <Section title="Service health" description="Targets scraped by Prometheus">
          <ul className="space-y-2.5 text-sm">
            {[
              { name: "inference-gateway", status: "up", lat: "12ms" },
              { name: "yolo-detector", status: "up", lat: "38ms" },
              { name: "whisper-asr", status: "up", lat: "412ms" },
              { name: "bert-classifier", status: "up", lat: "22ms" },
              { name: "llama-describer", status: "degraded", lat: "910ms" },
              { name: "sdxl-visuals", status: "up", lat: "2.3s" },
              { name: "compliance-rules", status: "up", lat: "9ms" },
            ].map((t) => (
              <li key={t.name} className="flex items-center justify-between rounded-md border bg-card px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${t.status === "up" ? "bg-success" : t.status === "degraded" ? "bg-warning" : "bg-destructive"}`} />
                  <span className="font-mono text-xs">{t.name}</span>
                </div>
                <span className="text-xs tabular-nums text-muted-foreground">{t.lat}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {/* Accuracy / Drift / Throughput Grafana-style row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Section title="Accuracy" description="avg(model_accuracy) by (model)">
          <ChartContainer config={{ accuracy: { label: "Accuracy", color: "var(--chart-1)" } }} className="h-[180px] w-full">
            <LineChart data={mlopsSeries}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
              <YAxis domain={[0.85, 0.96]} tick={{ fontSize: 10 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line dataKey="accuracy" stroke="var(--color-accuracy)" dot={false} strokeWidth={2} />
            </LineChart>
          </ChartContainer>
        </Section>
        <Section title="Drift (KL divergence)" description="model_feature_drift_score">
          <ChartContainer config={{ drift: { label: "Drift", color: "var(--chart-5)" } }} className="h-[180px] w-full">
            <AreaChart data={mlopsSeries}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ReferenceLine y={0.06} stroke="var(--chart-5)" strokeDasharray="4 4" />
              <Area dataKey="drift" stroke="var(--color-drift)" fill="var(--color-drift)" fillOpacity={0.22} type="monotone" />
            </AreaChart>
          </ChartContainer>
        </Section>
        <Section title="Throughput" description="sum(rate(inferences_total[1m]))">
          <ChartContainer config={{ throughput: { label: "Throughput", color: "var(--chart-2)" } }} className="h-[180px] w-full">
            <LineChart data={mlopsSeries}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line dataKey="throughput" stroke="var(--color-throughput)" dot={false} strokeWidth={2} />
            </LineChart>
          </ChartContainer>
        </Section>
      </div>

      {/* Model fleet table */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Section title="Model fleet" description="Live health across the production registry" actions={<Badge variant="outline">{modelsList.length} models</Badge>}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Model</th>
                  <th className="py-2 pr-3 font-medium">Version</th>
                  <th className="py-2 pr-3 font-medium">Accuracy</th>
                  <th className="py-2 pr-3 font-medium">p95</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {modelsList.map((m) => (
                  <tr key={m.name} className="border-t">
                    <td className="py-2.5 pr-3">
                      <div className="font-medium">{m.name.split(" — ")[0]}</div>
                      <div className="text-xs text-muted-foreground">{m.framework}</div>
                    </td>
                    <td className="py-2.5 pr-3 font-mono text-xs">{m.version}</td>
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2">
                        <Progress value={m.accuracy * 100} className="h-1.5 w-16" />
                        <span className="tabular-nums text-xs">{m.accuracy ? `${Math.round(m.accuracy * 100)}%` : "—"}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 tabular-nums text-xs">{m.latency}ms</td>
                    <td className="py-2.5 pr-3">
                      {m.status === "healthy" ? (
                        <Badge variant="outline" className="gap-1 border-success/40 bg-success/10 text-success"><CheckCircle2 className="h-3 w-3" />healthy</Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 border-warning/40 bg-warning/10 text-warning-foreground"><AlertTriangle className="h-3 w-3" />drift</Badge>
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && modelsList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-muted-foreground">No active models detected.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Alerts & retraining jobs" description="Alertmanager + MLflow">
          <ul className="divide-y">
            {activityList.map((a, i) => (
              <li key={i} className="flex items-start gap-3 py-3 text-sm">
                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${a.kind === "warn" ? "bg-warning" : a.kind === "ok" ? "bg-success" : "bg-muted-foreground"}`} />
                <div className="min-w-0 flex-1">
                  <div className="leading-snug">{a.text}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{a.time}</div>
                </div>
              </li>
            ))}
            {!loading && activityList.length === 0 && (
              <li className="text-center py-6 text-muted-foreground text-xs">No alerts or retraining activity logs found.</li>
            )}
          </ul>
        </Section>
      </div>

      {/* Infra footer */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfraCard icon={Server} label="Pods" value="42 / 48" hint="kube-prod" />
        <InfraCard icon={Gauge} label="Queue depth" value="13" hint="kafka.inference.in" />
        <InfraCard icon={Cpu} label="vRAM in use" value="58.2 GB" hint="across 8× T4" />
        <InfraCard icon={Activity} label="Uptime" value="99.982%" hint="30-day rolling" />
      </div>
    </div>
  );
}

function LiveStat({
  icon: Icon,
  label,
  value,
  hint,
  series,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
  series: LiveMetric[];
  color: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2 font-display text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
      <div className="mt-2 h-10">
        <ChartContainer config={{ v: { label, color } }} className="h-full w-full">
          <AreaChart data={series}>
            <Area dataKey="v" stroke="var(--color-v)" fill="var(--color-v)" fillOpacity={0.2} type="monotone" strokeWidth={1.5} isAnimationActive={false} />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  );
}

function InfraCard({ icon: Icon, label, value, hint }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2 font-display text-lg font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}