import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Upload, Sparkles, Package, Clock, Store, Zap, Shield, Play, Volume2, Star, CheckCircle, Brain, Eye } from "lucide-react";
import { PageHeader, Section, StatusBadge } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LaunchOps AI — Multimodal Product Launch Studio" },
      { name: "description", content: "Turn simple product inputs into professional e-commerce launch assets instantly." },
      { property: "og:title", content: "LaunchOps AI — Automated E-Commerce Launch" },
      { property: "og:description", content: "Generate studio photos, cinematic video ads, SEO titles, descriptions and pricing using AI." },
    ],
  }),
  component: RootIndexRoute,
});

function RootIndexRoute() {
  const auth = useAuth();
  return auth.authed ? <SellerDashboard name={auth.name || "Seller"} /> : <LandingPage />;
}

/* ==========================================
   1. LANDING PAGE (Public View)
   ========================================== */
function LandingPage() {
  const [activeDemoTab, setActiveDemoTab] = useState<"text" | "image" | "video" | "voice">("text");

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-hidden">
      {/* Decorative Blur Blobs (Subtle ambient light) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/25">
              <Zap className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-foreground">
              LaunchOps AI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline-block text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-medium">Platform</span>
            <span className="hidden md:inline-block text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-medium font-medium">Features</span>
            <span className="hidden md:inline-block text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-medium">Showcase</span>
            <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/95 text-primary-foreground shadow-md">
              <Link to="/login">Launch Studio <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold mb-6">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>Unified Multimodal AI Engine</span>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight leading-none text-foreground max-w-4xl mx-auto">
          Turn Simple Product Inputs into{" "}
          <span className="bg-gradient-to-r from-primary via-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-primary dark:via-indigo-400 dark:to-purple-400">
            Professional E-Commerce Launch Assets
          </span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Provide a rough photo, video, text prompt, or a quick voice description. Our AI platform fuses them to generate studio photos, cinematic promotional ads, and marketplace-ready catalog listings instantly.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/95 text-primary-foreground px-8 h-12 shadow-md text-base font-semibold">
            <Link to="/login">Start Launching Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-border hover:bg-accent px-8 h-12 text-base font-semibold">
            <a href="#demo">Watch Workflow</a>
          </Button>
        </div>
      </section>

      {/* AI Demo Animation Section */}
      <section id="demo" className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-xl shadow-foreground/5">
          <div className="flex flex-col md:flex-row gap-8 items-stretch">
            {/* Input Selection Panel */}
            <div className="md:w-2/5 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">AI Product Launch Studio</h3>
                <p className="text-sm text-muted-foreground mb-6">Select a mock raw seller input to preview how the platform automates listing, creative, and launch outputs.</p>
              </div>
              <div className="space-y-3">
                <DemoTabButton active={activeDemoTab === "text"} onClick={() => setActiveDemoTab("text")} label="Text Idea" desc="Organic cosmetics face cream" icon={ArrowRight} />
                <DemoTabButton active={activeDemoTab === "image"} onClick={() => setActiveDemoTab("image")} label="Raw Photo" desc="Mobile snapshot on desk" icon={Upload} />
                <DemoTabButton active={activeDemoTab === "video"} onClick={() => setActiveDemoTab("video")} label="Raw Video" desc="Rough handheld camera pan" icon={Play} />
                <DemoTabButton active={activeDemoTab === "voice"} onClick={() => setActiveDemoTab("voice")} label="Voice Note" desc="'Hydrating cream formula...'" icon={Volume2} />
              </div>
            </div>

            {/* Output Pipeline Demonstration */}
            <div className="flex-1 rounded-xl border bg-muted/30 p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <span className="text-xs font-mono text-primary font-bold tracking-wider uppercase">Active AI Pipeline</span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {/* Dynamic Preview Contents */}
              <div className="flex-1 flex flex-col justify-center min-h-[220px]">
                {activeDemoTab === "text" && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="p-3 rounded-lg bg-background border text-xs font-mono text-muted-foreground">
                      &gt; INPUT: &quot;Luxury handmade organic skincare cream&quot;
                    </div>
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                      <div className="text-xs text-primary font-bold">AI Generated SEO Listing Title</div>
                      <div className="text-sm font-semibold text-foreground">Botanical Bloom Premium Organic Face Cream — 100% Vegan & Hydrating</div>
                      <div className="text-xs text-muted-foreground leading-relaxed">Artisanal skincare cream crafted from cold-pressed jojoba oils and wild chamomile...</div>
                    </div>
                  </div>
                )}

                {activeDemoTab === "image" && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg border bg-card p-2 text-center shadow-sm">
                        <div className="aspect-square bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                          Raw Image (Desk backdrop)
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-2 block font-medium">Seller Snapshot</span>
                      </div>
                      <div className="rounded-lg border border-primary/30 bg-primary/5 p-2 text-center relative overflow-hidden shadow-sm">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none" />
                        <div className="aspect-square bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/10 rounded flex flex-col items-center justify-center text-xs text-primary font-bold border border-primary/20">
                          <span className="text-[9px] text-slate-400 font-mono block">ORGANIC</span>
                          <div className="w-10 h-10 rounded-full bg-emerald-500/20 blur-xs shadow-inner mt-1" />
                          <span className="text-[9px] font-bold text-slate-800 dark:text-slate-200 mt-2 text-center leading-none">Studio Photo</span>
                        </div>
                        <span className="text-[10px] text-primary mt-2 block font-semibold">✨ SDXL Enhanced</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeDemoTab === "video" && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-center shadow-sm">
                      <Play className="h-8 w-8 text-primary mx-auto mb-2 animate-bounce animate-pulse" />
                      <div className="text-sm font-semibold text-foreground">Cinematic Social Ad Sync</div>
                      <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">AI camera pans, storyboard keyframes extracted, sound score layered.</p>
                      <div className="mt-3 flex justify-center gap-1.5">
                        <span className="h-1.5 w-6 rounded bg-primary" />
                        <span className="h-1.5 w-6 rounded bg-primary" />
                        <span className="h-1.5 w-6 rounded bg-primary/30" />
                      </div>
                    </div>
                  </div>
                )}

                {activeDemoTab === "voice" && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex gap-2 items-center justify-center p-3 rounded-lg bg-background border">
                      <Volume2 className="h-4 w-4 text-primary animate-pulse" />
                      <div className="flex h-4 items-end gap-0.5">
                        {Array.from({length:12}).map((_,i)=>(<span key={i} className="w-1 bg-primary/80 rounded-sm" style={{height:`${10+Math.abs(Math.sin(i))*90}%`}}/>))}
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">0:08</span>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
                      <div className="text-[10px] font-mono text-primary font-bold">WHISPER TRANSCRIPT</div>
                      <p className="text-xs text-foreground italic leading-relaxed">&quot;Organic skincare cream, natural chamomile moisturizing benefits...&quot;</p>
                      <div className="flex gap-1.5 mt-1">
                        <span className="text-[9px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">Cosmetics</span>
                        <span className="text-[9px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">Chamomile</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Indicators */}
              <div className="mt-4 border-t pt-4 flex justify-between items-center text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Brain className="h-3.5 w-3.5 text-primary" /> Fusion Intelligence active</span>
                <span>Launch Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 relative z-10 border-t">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">Platform Creative Capabilities</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">Everything needed to list, brand, promote, and verify your product on global retail channels in under three minutes.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard icon={Sparkles} title="AI Copywriting Engine" desc="Transforms voice descriptors or simple keywords into highly polished, SEO-optimized title headers and descriptions targeting Amazon, Flipkart, and Meesho tags." />
          <FeatureCard icon={Brain} title="Multimodal Fusion Intelligence" desc="Synthesizes visual cues from photo uploads, narrative speech notes, and text schemas to catalog products precisely without manual data entry." />
          <FeatureCard icon={Eye} title="Before/After Visual Studio" desc="Strips raw backgrounds instantly, rendering products in premium minimalist studio environments, lifestyle settings, and 1:1 square Crops." />
          <FeatureCard icon={Play} title="Cinematic Promotional Videos" desc="Generates highly aesthetic e-commerce short ads and reels. Embeds video overlays, smooth transitions, and smart subtitles in a single render pipeline." />
          <FeatureCard icon={Store} title="Dual Channel Sandbox Previews" desc="Simulates actual listings side-by-side on Amazon, Flipkart, and Meesho. Includes automated formatting and HSN/GST compliance validators." />
          <FeatureCard icon={Shield} title="Pricing Intelligence & Margins" desc="Scrapes active competitors, recommends target profit margins, and models pricing demand elasticity to maximize launch sell-through rates." />
        </div>
      </section>

      {/* Workflow Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t relative z-10 bg-muted/10">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">Automated AI Launch Pipeline</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-sm">How your product moves from sensory input files to active checkout listings.</p>
        </div>
        <div className="relative border-l border-primary/20 max-w-3xl mx-auto pl-6 sm:pl-8 space-y-12">
          <WorkflowStep number="1" title="Sensory Input Upload" desc="Drop images, video clips, speech notes, or rough descriptors. Our API parses files into structured pipeline loaders." />
          <WorkflowStep number="2" title="Deep Vision & Speech Recognition" desc="YOLOv8 detects objects and brand tags; Microsoft TrOCR reads text labels; OpenAI Whisper transcribes speech files." />
          <WorkflowStep number="3" title="Sensory Token Fusion" desc="Fuses text, voice signals, and visual features. Predicts retail category structures using optimized classification weights." />
          <WorkflowStep number="4" title="Stable Diffusion & Cinematic Rendering" desc="Generates luxury background studio backdrops, high-fidelity promotional media files, and branding card assets." />
          <WorkflowStep number="5" title="Marketplace Export & Sync" desc="Formulates fully compliant listing packs for Amazon, Flipkart, or Meesho, and publishes in one click." />
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20 text-center relative z-10">
        <div className="rounded-3xl bg-card border p-8 sm:p-12 relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(var(--color-primary),0.05),transparent_60%)] pointer-events-none" />
          <Zap className="h-10 w-10 text-primary mx-auto mb-6" />
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">Ready to automate your e-commerce launching?</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base mb-8">
            Create professional photos, video commercials, competitive pricing, and rich SEO listing cards from a single product input.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/95 text-primary-foreground px-8 h-12 shadow-md text-base font-semibold">
            <Link to="/login">Launch Studio Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function DemoTabButton({
  active,
  onClick,
  label,
  desc,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between rounded-xl border p-4 text-left transition-all ${active ? "border-primary bg-primary/10 shadow-sm text-foreground" : "border-border bg-card hover:bg-accent/40 text-muted-foreground hover:text-foreground"}`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div>
          <div className="text-sm font-bold text-foreground">{label}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
        </div>
      </div>
      <ArrowRight className={`h-4 w-4 text-muted-foreground/60 transition-transform ${active ? "translate-x-0.5 text-primary" : ""}`} />
    </button>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border bg-card p-6 transition-all hover:bg-accent/20 hover:scale-[1.01] shadow-sm hover:border-primary/20">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-5">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-display text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function WorkflowStep({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="relative group">
      <div className="absolute -left-12 sm:-left-[37px] top-0.5 flex h-7 w-7 items-center justify-center rounded-full border bg-background text-xs font-bold text-primary shadow-sm group-hover:border-primary transition-colors">
        {number}
      </div>
      <div>
        <h4 className="font-display text-base font-bold text-foreground">{title}</h4>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ==========================================
   2. SELLER DASHBOARD (Authenticated View)
   ========================================== */
function SellerDashboard({ name }: { name: string }) {
  const [productList, setProductList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProductList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const totalLaunched = productList.filter((p) => p.status === "published").length;
  const totalGenerations = productList.filter((p) => p.status === "generated" || p.status === "published").length * 4;

  const kpis = [
    { label: "Products Processed", value: loading ? "..." : productList.length, icon: Package, sub: "Total catalog count" },
    { label: "AI Videos Generated", value: loading ? "..." : totalLaunched * 2 + 3, icon: Play, sub: "Cinematic commercial ads" },
    { label: "AI Images Generated", value: loading ? "..." : totalGenerations, icon: Sparkles, sub: "Across all creative options" },
    { label: "Marketplace Ready Products", value: loading ? "..." : totalLaunched, icon: Store, sub: "Published to global channels" },
    { label: "Launch Success Rate", value: "98.4%", icon: Shield, sub: "Optimized catalog scorecard" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title={`Welcome back, ${name}`}
        description="Fuses images, videos, and voice inputs into marketplace listing cards automatically."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/products"><Package className="mr-2 h-4 w-4" />My Products</Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/95">
              <Link to="/upload"><Upload className="mr-2 h-4 w-4" />Upload Studio</Link>
            </Button>
          </div>
        }
      />

      {/* Modern Grid layout for metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-primary/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{k.label}</span>
              <k.icon className="h-4 w-4 text-muted-foreground/75" />
            </div>
            <div className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground">{k.value}</div>
            <div className="mt-1 text-[11px] text-muted-foreground leading-tight">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Section
          title="Recent Launches"
          description="Catalog products processed by your AI engine."
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/products">View Catalog <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          }
        >
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 py-2 font-semibold">Product Detail</th>
                  <th className="px-3 py-2 font-semibold">Classification</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2 font-semibold">Channels</th>
                  <th className="px-3 py-2 font-semibold">Price</th>
                </tr>
              </thead>
              <tbody>
                {productList.slice(0, 5).map((p) => (
                  <tr key={p.id} className="border-t hover:bg-muted/10 transition-colors">
                    <td className="px-3 py-3">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{p.id}</div>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{p.category}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={p.status === "draft" ? "warn" : p.status === "generated" ? "ok" : "pass"} />
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-medium">{p.marketplaces.join(" · ") || "—"}</span>
                    </td>
                    <td className="px-3 py-3 font-medium">₹{p.price.toLocaleString()}</td>
                  </tr>
                ))}
                {!loading && productList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">No recent launch assets in database. Get started in the Upload Studio!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Section>
      </div>
    </div>
  );
}
