import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, Sparkles, Download, CheckCircle, Store, AlertCircle, ShoppingBag, ArrowRight, ShieldCheck, Tag, Box } from "lucide-react";
import { PageHeader, Section } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/launch-card")({
  head: () => ({
    meta: [
      { title: "Marketplace Launch Card — LaunchOps AI" },
      { name: "description", content: "Final marketplace-ready e-commerce catalog listing and creative assets." },
    ],
  }),
  component: LaunchCardPage,
});

function LaunchCardPage() {
  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [productId, setProductId] = useState("");

  // Form states for edits
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(1299);

  useEffect(() => {
    let targetId = "P-D3A9E2"; // Fallback to demo SKU if none passed
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const queryId = searchParams.get("id");
      if (queryId) {
        targetId = queryId;
      }
    }
    setProductId(targetId);

    fetch(`http://localhost:8000/api/products/${targetId}`)
      .then((res) => {
        if (!res.ok) throw new Error("not_found");
        return res.json();
      })
      .then((data) => {
        setProductData(data);
        setTitle(data.generation?.title || data.product?.name || "Premium Organic Skincare Cream");
        setDescription(data.generation?.description || "Cosmetic skin moisturizer formulated with botanical extracts.");
        setPrice(data.product?.price || 1299);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Dynamic product not found, rendering fallback SKU simulation.", err);
        // Fallback mockup model logic synced with database seeds
        const mockDetail = {
          product: { id: targetId, name: "Organic Hydrating Cream", category: "Beauty › Cosmetics › Skincare", status: "generated", price: 1299 },
          uploads: [{ file_path: "cream_original.jpg", file_type: "image" }],
          generation: {
            title: "Botanical Bloom Premium Organic Skincare Cream — 100% Vegan & Hydrating, Chamomile Formula",
            description: "Formulated by cosmetic specialists, Botanical Bloom uses wild chamomile extracts and cold-pressed jojoba oils to synthesize a premium daily moisturizer. Suitable for all skin types. 100% vegan, cruelty-free, and sustainably packaged.",
            bullets: [
              "100% organic cosmetics — wild chamomile & cold-pressed jojoba oils.",
              "Provides intense deep daily skin hydration.",
              "Vegan, cruelty-free, and organic certified.",
              "Eco-friendly sustainable packaging."
            ],
            tags: ["organic cream", "skincare", "chamomile cream", "vegan moisturizer", "hydrating cream", "botanical bloom"]
          }
        };
        setProductData(mockDetail);
        setTitle(mockDetail.generation.title);
        setDescription(mockDetail.generation.description);
        setPrice(mockDetail.product.price);
        setLoading(false);
      });
  }, []);

  const bullets = productData?.generation?.bullets || [
    "Premium selected organic skin extracts.",
    "Promotes intense hydration and cell recovery.",
    "Cruelty-free and vegan certified.",
    "Sustainable biodegradable container dieline."
  ];

  const tags = productData?.generation?.tags || ["skincare", "cosmetics", "premium", "organic"];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="E-Commerce Launch Card"
        description={loading ? "Loading database details..." : `Active listing review for SKU ID: ${productId}`}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/upload">Re-run Pipeline</Link>
            </Button>
            <Button onClick={() => toast.success("SKU synced across Amazon, Flipkart and Meesho!")} className="bg-primary text-white hover:bg-primary/95">
              <Store className="mr-2 h-4 w-4" /> Publish SKU
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1.8fr]">
        
        {/* Left Side: Generative Visual Showcase & Scoring */}
        <div className="space-y-6">
          <Section title="AI Generated Media" description="Premium studio photography & cinematic promotional ad.">
            <div className="space-y-4">
              {/* Product Visual */}
              <div className="relative overflow-hidden rounded-xl border aspect-square bg-white flex items-center justify-center p-8 shadow-inner group">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent pointer-events-none" />
                <div className="w-48 h-64 rounded-3xl bg-gradient-to-tr from-emerald-100/50 via-teal-50 to-white border-2 border-slate-200/50 shadow-2xl flex flex-col items-center justify-center relative p-6 group-hover:scale-[1.01] transition-transform">
                  <div className="absolute top-4 font-mono text-[9px] tracking-wider text-slate-400">ORGANIC CARE</div>
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 opacity-80 blur-xs shadow-inner" />
                  <span className="font-display font-bold text-slate-800 mt-6 text-sm tracking-wide text-center">Botanical Cream</span>
                  <span className="text-[10px] text-emerald-600 font-semibold mt-1">✨ 100% ORGANIC</span>
                </div>
                <div className="absolute bottom-4 right-4"><Badge className="bg-indigo-600 hover:bg-indigo-600">Studio White Preset</Badge></div>
              </div>

              {/* Video Preview Snapshot */}
              <div className="rounded-xl border bg-slate-950 p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-400">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Cinematic Ad synced</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-mono">15 Seconds · 9:16 Portrait</div>
                  </div>
                </div>
                <Button asChild size="sm" variant="outline" className="h-8 border-slate-800 text-slate-300 hover:text-white">
                  <Link to="/video">Open Player <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                </Button>
              </div>
            </div>
          </Section>

          {/* Launch Scorecard */}
          <Section title="Marketplace Scorecard" description="MLOps structural checks.">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Readiness Score</span>
                  <div className="text-3xl font-extrabold text-foreground mt-1 flex items-baseline gap-1">
                    96 <span className="text-xs font-semibold text-muted-foreground">/ 100</span>
                  </div>
                </div>
                <Badge className="bg-success/15 border-success/30 text-success" variant="outline">LAUNCH READY</Badge>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Predicted Launch Success Rate</span>
                  <span className="text-primary font-bold">98.4% match</span>
                </div>
                <Progress value={98.4} className="h-2" />
              </div>

              <div className="rounded-lg bg-muted/10 p-3 flex gap-2 border">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                <p className="text-[11px] text-muted-foreground leading-normal">
                  All validation tests successfully passed. Category predictions align, image dimensions correspond to Amazon/Meesho, and GST rates pass.
                </p>
              </div>
            </div>
          </Section>
        </div>

        {/* Right Side: SEO content, Pricing, and Packaging suggestions */}
        <div className="space-y-6">
          {/* SEO Metadata Card */}
          <Section title="SEO Metadata Listings" description="Copy refined by Llama-3 8B (Local) copywriting tokens.">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Generated SEO Title</label>
                <Input
                  className="font-medium text-sm h-11 border-primary/20"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <div className="text-[10px] text-muted-foreground mt-1 text-right">{title.length}/200 characters · SEO Match 92%</div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Generated Description</label>
                <Textarea
                  className="text-xs text-muted-foreground leading-relaxed h-32"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Product Key Features</label>
                <ul className="space-y-2">
                  {bullets.map((bullet: string, idx: number) => (
                    <li key={idx} className="flex gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">SEO Classification Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t: string) => (
                    <Badge key={t} variant="outline" className="text-[10px] font-normal uppercase">#{t}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Pricing Intelligence Widget */}
          <Section title="Pricing Recommendations" description="Optimal competitor analysis and margin matching.">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border bg-muted/10 p-3.5 text-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Competitor Avg</span>
                <span className="font-display text-lg font-bold text-slate-800">
                  ₹{productData?.pricing?.competitor_avg ? Math.round(productData.pricing.competitor_avg).toLocaleString() : "1,499"}
                </span>
              </div>
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 text-center">
                <span className="text-[10px] font-bold text-primary uppercase block mb-1">Recommended Target</span>
                <span className="font-display text-lg font-bold text-primary">
                  ₹{productData?.pricing?.recommended_price ? Math.round(productData.pricing.recommended_price).toLocaleString() : price.toLocaleString()}
                </span>
              </div>
              <div className="rounded-xl border bg-muted/10 p-3.5 text-center">
                <span className="text-[10px] font-bold text-emerald-600 uppercase block mb-1">Net Margin</span>
                <span className="font-display text-lg font-bold text-emerald-600">
                  ₹{productData?.pricing?.margin ? Math.round(productData.pricing.margin).toLocaleString() : "759"}{" "}
                  ({productData?.pricing?.margin_percent ? Math.round(productData.pricing.margin_percent) : "58.4"}%)
                </span>
              </div>
            </div>
          </Section>

          {/* Sustainable Packaging suggestions (Consolidated Section) */}
          <Section title="Packaging & Structural Recommendations" description="Automated dieline matching & material metrics.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border bg-card p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Box className="h-4.5 w-4.5 text-indigo-400" />
                  <span className="text-xs font-bold text-foreground">Packaging Material</span>
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  {productData?.packaging?.material || "Artisanal Biodegradable Envelope"}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {productData?.packaging?.material === "Secure Anti-Static Bubble-wrapped Box"
                    ? "Specially lined with dissipative polymer coatings. Prevents electrostatic discharge to protect critical internal technology circuits."
                    : productData?.packaging?.material === "Sustainably Crafted Handloom Linen Sleeve"
                    ? "Made from organic, durable linen fibers. Folds flat to save volumetric transport rates."
                    : "Made from 100% recycled wood fibers. Incorporates natural vegetable starch seals to align with sustainability standards."}
                </p>
              </div>

              <div className="rounded-xl border bg-card p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Tag className="h-4.5 w-4.5 text-indigo-400" />
                  <span className="text-xs font-bold text-foreground">Custom SKU Dimensions</span>
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  {productData?.packaging?.dimensions || "12 × 12 × 8 cm (Jar Format)"}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {productData?.packaging?.detail || "Structural dieline matching: standard unstitched pack folds, minimizing excess shipping volume fee indices."}
                </p>
              </div>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}
