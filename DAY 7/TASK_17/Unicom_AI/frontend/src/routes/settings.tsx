import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — LaunchOps AI" }, { name: "description", content: "Account, marketplace connections and notifications." }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Settings" description="Manage your account and marketplace integrations." />
      <div className="space-y-6">
        <Section title="Profile">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" defaultValue="Anika Sharma" />
            <Field label="Store name" defaultValue="Mitti Crafts" />
            <Field label="Email" defaultValue="anika@mitticrafts.in" />
            <Field label="Phone" defaultValue="+91 98XXX XXXXX" />
          </div>
          <Button className="mt-4">Save changes</Button>
        </Section>
        <Section title="Marketplace connections">
          {["Amazon","Flipkart","Meesho"].map(m=>(
            <div key={m} className="flex items-center justify-between border-b py-3 last:border-0">
              <div><div className="text-sm font-medium">{m}</div><div className="text-xs text-muted-foreground">Connected via OAuth</div></div>
              <Switch defaultChecked />
            </div>
          ))}
        </Section>
        <Section title="Notifications">
          {[["Generation complete","Email when AI finishes a listing"],["Marketplace status","Publishing successes & failures"],["Weekly summary","Performance recap every Monday"]].map(([t,d])=>(
            <div key={t} className="flex items-center justify-between border-b py-3 last:border-0">
              <div><div className="text-sm font-medium">{t}</div><div className="text-xs text-muted-foreground">{d}</div></div>
              <Switch defaultChecked />
            </div>
          ))}
        </Section>
      </div>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div><label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label><Input defaultValue={defaultValue}/></div>
  );
}