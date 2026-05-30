import { createFileRoute } from "@tanstack/react-router";
import { Copy, FileText, ImageIcon, Mic, RefreshCw, Sparkles, Video } from "lucide-react";
import { PageHeader, Section } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { generationResult, multimodalCopyOutputs } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/generation")({
  head: () => ({
    meta: [
      { title: "AI Generation — LaunchOps AI" },
      { name: "description", content: "Generated SEO title, description, category and tags for your product." },
    ],
  }),
  component: GenerationPage,
});

function GenerationPage() {
  const g = generationResult;
  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Clipboard unavailable");
    }
  };
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Title & Description"
        description="The same AI copy engine accepts text, image, video or speech and generates marketplace-ready title and description."
        actions={<><Button variant="outline" onClick={() => toast.info("Regenerating with latest models…")}><RefreshCw className="mr-2 h-4 w-4" />Regenerate</Button><Button onClick={() => toast.success("Applied to draft listing")}><Sparkles className="mr-2 h-4 w-4" />Apply to listing</Button></>}
      />

      <Section title="Multimodal input to AI copy process" description="Each seller input becomes structured product understanding, then SEO title and description output.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <ModalityOutput icon={FileText} label="Text input" data={multimodalCopyOutputs.text} />
          <ModalityOutput icon={ImageIcon} label="Image input" data={multimodalCopyOutputs.image} />
          <ModalityOutput icon={Video} label="Video input" data={multimodalCopyOutputs.video} />
          <ModalityOutput icon={Mic} label="Speech input" data={multimodalCopyOutputs.speech} />
        </div>
      </Section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <Section title="Source preview">
            <div className="aspect-square overflow-hidden rounded-lg border bg-gradient-to-br from-muted via-accent to-muted" />
            <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
              <Badge variant="secondary">image-01.jpg</Badge>
              <Badge variant="secondary">voice-note.mp3</Badge>
              <Badge variant="secondary">text input</Badge>
            </div>
          </Section>

          <Section title="Confidence" description="Per-attribute model confidence">
            {Object.entries(g.confidence).map(([k, v]: [string, any]) => (
              <div key={k} className="mb-3 last:mb-0">
                <div className="mb-1 flex justify-between text-xs"><span className="capitalize text-muted-foreground">{k}</span><span className="tabular-nums">{Math.round((v as number) * 100)}%</span></div>
                <Progress value={(v as number) * 100} />
              </div>
            ))}
          </Section>

          <Section title="Predicted category">
            <div className="flex flex-wrap items-center gap-1.5 text-sm">
              {g.category.map((c: string, i: number) => (
                <span key={c} className="flex items-center gap-1.5">
                  <span>{c}</span>
                  {i < g.category.length - 1 && <span className="text-muted-foreground">›</span>}
                </span>
              ))}
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="SEO title" description="Optimized for marketplace search" actions={<Button size="sm" variant="ghost" onClick={() => copy(g.title, "Title")}><Copy className="mr-2 h-3.5 w-3.5"/>Copy</Button>}>
            <Input className="text-base" defaultValue={g.title} />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{g.title.length} / 200 characters</span>
              <span>SEO score · 92</span>
            </div>
          </Section>

          <Section title="Description" actions={<Button size="sm" variant="ghost" onClick={() => copy(g.description, "Description")}><Copy className="mr-2 h-3.5 w-3.5"/>Copy</Button>}>
            <Textarea rows={6} defaultValue={g.description} />
          </Section>

          <Section title="Key features">
            <ul className="space-y-2 text-sm">
              {g.bullets.map((b: string) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {b}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="SEO tags">
            <div className="flex flex-wrap gap-2">
              {g.tags.map((t: string) => (
                <Badge key={t} variant="outline" className="font-normal">#{t}</Badge>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function ModalityOutput({
  icon: Icon,
  label,
  data,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  data: { source: string; title: string; description: string; signals: string[] };
}) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-medium">{label}</div>
          <code className="block max-w-[14rem] truncate text-[10px] text-muted-foreground">{data.source}</code>
        </div>
      </div>
      <div className="text-xs font-semibold text-muted-foreground">AI generated title</div>
      <p className="mt-1 line-clamp-3 text-sm font-medium">{data.title}</p>
      <div className="mt-3 text-xs font-semibold text-muted-foreground">AI generated description</div>
      <p className="mt-1 line-clamp-4 text-xs leading-relaxed text-muted-foreground">{data.description}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {data.signals.map((signal) => <Badge key={signal} variant="secondary" className="text-[10px]">{signal}</Badge>)}
      </div>
    </div>
  );
}
