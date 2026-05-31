import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Platform settings — Admin · LaunchOps AI" },
      { name: "description", content: "Global platform configuration, model registry & retraining policies." },
    ],
  }),
  component: PlatformSettings,
});

function PlatformSettings() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Platform settings" description="Global configuration for the LaunchOps AI multimodal platform." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="MLOps thresholds" description="When to alert and auto-retrain">
          <div className="space-y-4">
            <Field label="Drift alert threshold" defaultValue="0.06" suffix="score" />
            <Field label="p95 latency budget" defaultValue="800" suffix="ms" />
            <Field label="Accuracy floor" defaultValue="0.88" suffix="ratio" />
            <Toggle label="Auto-retrain on drift" desc="Trigger MLflow job when threshold is breached" defaultChecked />
            <Toggle label="Shadow deploys" desc="Run new versions in parallel before promotion" defaultChecked />
          </div>
        </Section>

        <Section title="Inference & infra" description="Serving fleet configuration">
          <div className="space-y-4">
            <Field label="GPU pool (T4)" defaultValue="8" suffix="nodes" />
            <Field label="Max concurrency / model" defaultValue="32" suffix="req" />
            <Field label="Prometheus scrape interval" defaultValue="15" suffix="s" />
            <Toggle label="Stream LLM tokens" desc="Server-sent events for description model" defaultChecked />
            <Toggle label="Cache image embeddings" desc="Redis · 7-day TTL" defaultChecked />
          </div>
        </Section>

        <Section title="Marketplace integrations">
          <div className="space-y-3 text-sm">
            {["Amazon SP-API", "Flipkart Seller API", "Meesho Supplier API"].map((m) => (
              <div key={m} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="font-medium">{m}</div>
                  <div className="text-xs text-muted-foreground">Connected · OAuth refreshed 2h ago</div>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Security & audit">
          <div className="space-y-4">
            <Toggle label="SSO (SAML)" desc="Enforce SSO for admin role" defaultChecked />
            <Toggle label="Audit logging" desc="Stream to S3 + Datadog" defaultChecked />
            <Toggle label="PII redaction" desc="Strip from logs & prompts" defaultChecked />
            <Field label="Session timeout" defaultValue="60" suffix="min" />
          </div>
        </Section>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={() => toast.info("Changes reverted")}>Cancel</Button>
        <Button onClick={() => toast.success("Platform settings saved")}>Save changes</Button>
      </div>
    </div>
  );
}

function Field({ label, defaultValue, suffix }: { label: string; defaultValue: string; suffix: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      <div className="flex items-center gap-2">
        <Input defaultValue={defaultValue} />
        <span className="text-xs text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );
}

function Toggle({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div className="pr-4">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}