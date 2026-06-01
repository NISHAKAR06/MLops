import { createFileRoute } from "@tanstack/react-router";
import { Play, Video, Volume2, Sparkles, Download, Settings, Sliders, CheckCircle2 } from "lucide-react";
import { PageHeader, Section } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/video")({
  head: () => ({
    meta: [
      { title: "AI Video Studio — LaunchOps AI" },
      { name: "description", content: "Cinematic commercial video ads, vertical reels, keyframes extraction and subtitle formatting." },
    ],
  }),
  component: VideoPage,
});

const keyframes = [
  { time: "0:00", desc: "Product close-up, slow track-in", label: "Intro" },
  { time: "0:04", desc: "Jar cap unscrewing, organic texture reveal", label: "Detail" },
  { time: "0:08", desc: "Chamomile flower backdrop water splash", label: "Sensory" },
  { time: "0:12", desc: "Studio packaging text animation slide", label: "Specs" },
  { time: "0:15", desc: "Outro with logo and glowing CTA", label: "Outro" },
];

function VideoPage() {
  const [aspectRatio, setAspectRatio] = useState("landscape");
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [audioTrack, setAudioTrack] = useState("cinematic");
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="AI Video Studio"
        description="Cinematic promotional ads, social reels, and high-fidelity video catalogs created automatically."
        actions={
          <Button onClick={() => toast.success("AI video rendering triggered")} className="bg-primary hover:bg-primary/95 text-white">
            <Sparkles className="mr-2 h-4 w-4" /> Render Promo Video
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* Glassmorphic Cinematic Player */}
          <Section
            title="Cinematic Promotion Player"
            description="Preview the generated 15-second promotional video commercial."
          >
            <div
              className={`relative overflow-hidden rounded-2xl border bg-slate-950 flex items-center justify-center transition-all duration-300 ${aspectRatio === "landscape" ? "aspect-video" : aspectRatio === "portrait" ? "max-w-sm mx-auto aspect-[9/16] h-[480px]" : "max-w-md mx-auto aspect-square"}`}
            >
              {/* Animated Cinematic Background */}
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-indigo-950/20 to-slate-950 flex flex-col items-center justify-center p-6 text-center select-none">
                <div className={`w-40 h-40 rounded-full border border-indigo-500/20 flex items-center justify-center bg-indigo-500/5 relative ${isPlaying ? "animate-pulse" : ""}`}>
                  <Video className="h-12 w-12 text-indigo-400 opacity-60" />
                </div>
                <div className="mt-4 text-sm font-semibold tracking-wide text-white">
                  Botanical Hydrating Cream Promo Ad
                </div>
                <div className="text-xs text-slate-500 mt-1 font-mono">15 Seconds · 30 FPS · Ultra HD</div>

                {/* Subtitle overlay */}
                {showSubtitles && isPlaying && (
                  <div className="absolute bottom-12 left-6 right-6 p-2 rounded-lg bg-black/75 border border-slate-800 text-xs text-indigo-300 font-semibold tracking-wide text-center animate-in fade-in duration-200">
                    &quot;Formulated with wild Chamomile for natural skin hydration.&quot;
                  </div>
                )}
              </div>

              {/* Player Controllers */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 backdrop-blur-md">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsPlaying(!isPlaying);
                    toast.info(isPlaying ? "Video paused" : "Video playing");
                  }}
                  className="h-8 w-8 rounded-lg text-white hover:bg-slate-900 shrink-0"
                >
                  <Play className={`h-4.5 w-4.5 ${isPlaying ? "fill-white" : ""}`} />
                </Button>
                
                {/* Seek Bar progress bar */}
                <div className="flex-1 h-1.5 rounded-full bg-slate-800 relative cursor-pointer">
                  <div className={`absolute top-0 bottom-0 left-0 bg-indigo-500 rounded-full ${isPlaying ? "w-2/3 transition-all duration-10000 ease-linear" : "w-1/3"}`} />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Volume2 className="h-4 w-4 text-slate-400" />
                  <span className="text-[10px] font-mono text-slate-400">0:15</span>
                </div>
              </div>
            </div>
          </Section>

          {/* Filmstrip Timeline Keyframes */}
          <Section
            title="Video Reel Keyframes"
            description="Visual breakdown of the storyboard keyframes extracted from sensory inputs."
          >
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {keyframes.map((k, idx) => (
                <div key={idx} className="rounded-lg border bg-card p-2 text-left space-y-2 hover:border-indigo-500/30 transition-all cursor-pointer group">
                  <div className="aspect-video bg-gradient-to-br from-muted to-accent rounded flex items-center justify-center text-[10px] text-slate-500 font-mono border group-hover:scale-[1.02] transition-transform">
                    {k.label}
                  </div>
                  <div>
                    <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
                      <span>Frame {idx * 16}</span>
                      <span className="font-semibold text-primary">{k.time}</span>
                    </div>
                    <div className="text-[10px] text-foreground font-semibold mt-1 truncate leading-snug">{k.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Video Customization panel */}
        <div className="space-y-6">
          {/* Aspect Ratio Picker */}
          <Section title="Aspect Ratio format" description="Format ad sizes matching marketplace guidelines.">
            <div className="grid grid-cols-3 gap-2">
              <AspectRatioButton active={aspectRatio === "landscape"} onClick={() => { setAspectRatio("landscape"); toast.info("Format: Amazon Standard"); }} label="16:9 Landscape" val="Amazon HD" />
              <AspectRatioButton active={aspectRatio === "portrait"} onClick={() => { setAspectRatio("portrait"); toast.info("Format: Social Reels"); }} label="9:16 Portrait" val="Meesho Reel" />
              <AspectRatioButton active={aspectRatio === "square"} onClick={() => { setAspectRatio("square"); toast.info("Format: Square Catalog"); }} label="1:1 Square" val="Flipkart Post" />
            </div>
          </Section>

          {/* Closed Captions Subtitles */}
          <Section title="Subtitles & Formatting" description="Overlay closed captions using speech transcripts.">
            <div className="space-y-3.5 text-sm">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-muted-foreground font-semibold">Enable Subtitle Overlay</span>
                <button
                  onClick={() => {
                    setShowSubtitles(!showSubtitles);
                    toast.success(showSubtitles ? "Subtitles disabled" : "Subtitles enabled");
                  }}
                  className={`w-11 h-6 rounded-full transition-all relative ${showSubtitles ? "bg-indigo-600" : "bg-slate-700"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${showSubtitles ? "left-6" : "left-1"}`} />
                </button>
              </div>
              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground font-semibold">Subtitle Font Style</span><span className="font-bold text-foreground">Sora Bold</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground font-semibold">Subtitle Font Size</span><span>14 px (safe zone)</span></div>
            </div>
          </Section>

          {/* Audio Tracks Synchronization */}
          <Section title="Audio Score Synchronization" description="Sync sound scores to video pacing.">
            <div className="space-y-2">
              <AudioTrackButton active={audioTrack === "cinematic"} onClick={() => setAudioTrack("cinematic")} label="Ambient Cinematic" desc="Soft strings & organic percussion background." />
              <AudioTrackButton active={audioTrack === "upbeat"} onClick={() => setAudioTrack("upbeat")} label="Energetic Upbeat" desc="Fast transitions, retail commercial pacing." />
              <AudioTrackButton active={audioTrack === "botanical"} onClick={() => setAudioTrack("botanical")} label="Botanical Calm" desc="Lofi natural, perfect for organic cosmetics." />
            </div>
          </Section>

          {/* Model information */}
          <Section title="AI Video Engine" description="System telemetry.">
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between border-b pb-1.5"><span className="text-muted-foreground font-semibold">Backbone</span><span className="font-mono">Stable Video Diffusion</span></div>
              <div className="flex justify-between border-b pb-1.5"><span className="text-muted-foreground font-semibold">Render Time</span><span className="font-mono text-emerald-600">6.8 seconds</span></div>
              <div className="flex justify-between border-b pb-1.5"><span className="text-muted-foreground font-semibold">Extracted Frames</span><span className="font-mono">30 key frames</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground font-semibold">Compliance Rating</span><Badge className="bg-success/15 border-success/30 text-success" variant="outline">Amazon Fits CC</Badge></div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function AspectRatioButton({ active, onClick, label, val }: { active: boolean; onClick: () => void; label: string; val: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border p-3 text-center transition-all ${active ? "border-indigo-500 bg-indigo-500/5 shadow-md" : "border-border bg-card hover:border-foreground/15"}`}
    >
      <div className="text-[11px] font-bold text-foreground">{label}</div>
      <div className="text-[9px] text-muted-foreground mt-0.5">{val}</div>
    </button>
  );
}

function AudioTrackButton({ active, onClick, label, desc }: { active: boolean; onClick: () => void; label: string; desc: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between rounded-lg border p-2.5 text-left transition-all ${active ? "border-indigo-500 bg-indigo-500/5" : "border-border bg-card hover:border-foreground/15"}`}
    >
      <div className="flex items-center gap-2">
        <Volume2 className={`h-4 w-4 ${active ? "text-indigo-400" : "text-muted-foreground"}`} />
        <div>
          <div className="text-xs font-bold text-foreground">{label}</div>
          <div className="text-[9px] text-muted-foreground leading-normal">{desc}</div>
        </div>
      </div>
      {active && <CheckCircle2 className="h-4.5 w-4.5 text-indigo-500 shrink-0" />}
    </button>
  );
}
