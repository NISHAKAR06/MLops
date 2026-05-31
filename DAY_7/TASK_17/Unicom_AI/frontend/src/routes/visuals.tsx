import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Download, ArrowLeftRight, Image as ImageIcon, Sliders, ShieldAlert } from "lucide-react";
import { PageHeader, Section } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useRef } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/visuals")({
  head: () => ({
    meta: [
      { title: "AI Image Studio — LaunchOps AI" },
      { name: "description", content: "Draggable before/after sliders, background removal, and studio lighting enhancements." },
    ],
  }),
  component: VisualsPage,
});

const presets = [
  { id: "studio", title: "Studio White Backdrop", desc: "Pure-white studio background with soft ambient shadows.", color: "from-slate-100 to-slate-200 text-slate-800" },
  { id: "lifestyle", title: "Organic Lifestyle Scene", desc: "Product set in a natural, warm wooden spa environment.", color: "from-amber-100/40 via-amber-200/20 to-orange-100/30 text-amber-900" },
  { id: "crop", title: "Marketplace 1:1 Crop", desc: "Standardized square crop, 85% focused center product fill.", color: "from-slate-50 to-slate-100 text-slate-700" },
  { id: "enhance", title: "HDR Visual Booster", desc: "Intense sharpness boost, saturation balance, and soft glow.", color: "from-indigo-900/10 via-purple-900/10 to-indigo-950/10 text-indigo-400" },
];

function VisualsPage() {
  const [activePreset, setActivePreset] = useState("studio");
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="AI Image Studio"
        description="Background removal, professional lighting enhancement and dieline crops, rendered automatically."
        actions={
          <Button onClick={() => toast.success("Batch image generation triggered")} className="bg-primary hover:bg-primary/95 text-white">
            <Sparkles className="mr-2 h-4 w-4" /> Generate Batch
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Interactive Before/After Slider Canvas */}
        <Section
          title="Interactive Before · After Slider"
          description="Drag the center handle left or right to inspect original handheld snapshot vs. AI-rendered output."
        >
          <div
            ref={containerRef}
            className="relative h-[420px] rounded-2xl border overflow-hidden bg-slate-900 select-none cursor-ew-resize"
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onTouchEnd={() => setIsDragging(false)}
          >
            {/* 1. After (Enhanced Product Shot) Background */}
            <div className="absolute inset-0 bg-slate-950 flex items-center justify-center p-8">
              {activePreset === "studio" && (
                <div className="absolute inset-0 bg-white flex flex-col items-center justify-center transition-all duration-500">
                  <div className="w-56 h-72 rounded-3xl bg-gradient-to-tr from-emerald-100/50 via-teal-50 to-white border-2 border-slate-200/50 shadow-2xl flex flex-col items-center justify-center relative p-6">
                    <div className="absolute top-4 font-mono text-[9px] tracking-wider text-slate-400">ORGANIC CARE</div>
                    <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 opacity-80 blur-xs shadow-inner" />
                    <span className="font-display font-bold text-slate-800 mt-6 text-sm tracking-wide text-center">Botanical Cream</span>
                    <span className="text-[10px] text-emerald-600 font-semibold mt-1">✨ 100% ORGANIC</span>
                  </div>
                  <div className="w-64 h-12 bg-slate-400/20 rounded-full blur-xl absolute bottom-8 opacity-60 pointer-events-none" />
                </div>
              )}

              {activePreset === "lifestyle" && (
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-100 via-stone-100 to-orange-100 flex flex-col items-center justify-center transition-all duration-500">
                  {/* Mock Bamboo leaf */}
                  <div className="absolute top-4 left-4 w-40 h-40 bg-emerald-800/10 rounded-full blur-xl pointer-events-none" />
                  <div className="w-56 h-72 rounded-3xl bg-gradient-to-tr from-amber-50 to-amber-100/20 border border-amber-900/10 shadow-2xl flex flex-col items-center justify-center relative p-6 backdrop-blur-xs">
                    <div className="absolute top-4 font-mono text-[9px] tracking-wider text-amber-800">ORGANIC CARE</div>
                    <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 opacity-90 blur-xs" />
                    <span className="font-display font-bold text-amber-900 mt-6 text-sm tracking-wide text-center">Botanical Cream</span>
                    <span className="text-[10px] text-amber-700 font-semibold mt-1">SPA LIFESTYLE</span>
                  </div>
                  <div className="w-56 h-6 bg-stone-900/10 rounded-full blur-md absolute bottom-14 opacity-80" />
                </div>
              )}

              {activePreset === "crop" && (
                <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center transition-all duration-500 border-[16px] border-slate-200/40">
                  <div className="w-44 h-56 rounded-2xl bg-white border shadow-md flex flex-col items-center justify-center relative p-4 scale-95">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-300 opacity-70 blur-xs" />
                    <span className="font-display font-bold text-slate-800 mt-4 text-xs">Botanical Cream</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">1:1 Safe Crop Margin</span>
                  </div>
                </div>
              )}

              {activePreset === "enhance" && (
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 via-slate-950 to-purple-950 flex flex-col items-center justify-center transition-all duration-500">
                  <div className="w-56 h-72 rounded-3xl bg-gradient-to-tr from-indigo-900/50 to-purple-900/40 border border-indigo-500/30 shadow-2xl flex flex-col items-center justify-center relative p-6 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                    <div className="absolute top-4 font-mono text-[9px] tracking-wider text-indigo-400">ORGANIC CARE</div>
                    <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-400 shadow-[0_0_20px_rgba(52,211,153,0.4)]" />
                    <span className="font-display font-bold text-white mt-6 text-sm tracking-wide text-center">Botanical Cream</span>
                    <span className="text-[10px] text-indigo-400 font-semibold mt-1">HDR GLOW APPLIED</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Before (Raw Photo) Overlay */}
            <div
              className="absolute inset-0 bg-slate-900/90 border-r border-indigo-500/50 flex items-center justify-center p-8 overflow-hidden pointer-events-none"
              style={{ width: `${sliderPos}%` }}
            >
              <div className="absolute inset-0 w-[800px] h-[420px] bg-gradient-to-br from-slate-800 via-slate-900 to-stone-950 flex flex-col items-center justify-center p-8">
                {/* Simulated bad room lighting photo */}
                <div className="w-52 h-64 rounded-2xl bg-stone-700/80 border border-stone-600 flex flex-col items-center justify-center relative p-6 scale-95 opacity-80 shadow-inner">
                  <div className="w-24 h-24 rounded-full bg-stone-800 opacity-60" />
                  <span className="font-display font-bold text-stone-500 mt-6 text-xs text-center">Blurry Label Cream</span>
                  <span className="text-[9px] text-stone-600 mt-1">Background shadows present</span>
                </div>
              </div>
            </div>

            {/* Labels overlay */}
            <div className="absolute left-4 top-4 pointer-events-none"><Badge className="bg-slate-950/80 border-slate-800 text-slate-300 backdrop-blur-xs font-mono">Original Snapshot</Badge></div>
            <div className="absolute right-4 top-4 pointer-events-none"><Badge className="bg-indigo-600 hover:bg-indigo-600 text-white font-mono shadow-md shadow-indigo-600/20">AI Enhanced</Badge></div>

            {/* Draggable Slider Handle Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-indigo-500 cursor-ew-resize flex items-center justify-center"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="h-8 w-8 rounded-full bg-indigo-600 border-2 border-white text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <ArrowLeftRight className="h-4.5 w-4.5" />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground border-t pt-3">
            <span>💡 Click and drag the circular center handle to inspect the studio details.</span>
            <Button variant="ghost" size="sm" onClick={() => toast.success("Product visuals downloaded!")} className="h-8">
              <Download className="mr-1.5 h-4 w-4" /> Download Enhancement Pack
            </Button>
          </div>
        </Section>

        {/* Preset Selector Panel */}
        <div className="space-y-6">
          <Section title="Backdrop Presets" description="Select a Stable Diffusion model filter.">
            <div className="space-y-3">
              {presets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActivePreset(p.id);
                    toast.info(`Applied ${p.title}`);
                  }}
                  className={`w-full flex items-start gap-3 rounded-xl border p-3 text-left transition-all hover:scale-[1.01] ${activePreset === p.id ? "border-indigo-500 bg-indigo-500/5 shadow-md shadow-indigo-500/5" : "border-border bg-card hover:border-foreground/20"}`}
                >
                  <div className={`h-10 w-10 shrink-0 rounded-lg bg-gradient-to-tr ${p.color} flex items-center justify-center`}>
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      {p.title}
                      {activePreset === p.id && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{p.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </Section>

          {/* Model Specification Info */}
          <Section title="Visual Engine Specs" description="Deep neural network telemetry.">
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between border-b pb-1.5"><span className="text-muted-foreground font-semibold">Inference Model</span><span className="font-mono">Stable Diffusion XL Refiner</span></div>
              <div className="flex justify-between border-b pb-1.5"><span className="text-muted-foreground font-semibold">Diffusion Steps</span><span className="font-mono">30 steps (Euler-A scheduler)</span></div>
              <div className="flex justify-between border-b pb-1.5"><span className="text-muted-foreground font-semibold">Average Latency</span><span className="font-mono text-emerald-600">2.3 seconds</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground font-semibold">Fidelity Match</span><span className="font-mono text-primary font-bold">96.4% score</span></div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}