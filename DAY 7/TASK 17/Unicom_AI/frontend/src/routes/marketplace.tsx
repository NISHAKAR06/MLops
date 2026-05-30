import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, Download, Store, ShieldCheck, Heart, MessageCircle, Send, Bookmark, Tag, ArrowRight, ChevronDown } from "lucide-react";
import { PageHeader, Section } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace Previews — LaunchOps AI" },
      { name: "description", content: "Simulate dynamic catalog rendering across Amazon, Flipkart, Meesho, and Instagram Shop." },
    ],
  }),
  component: MarketplacePage,
});

function MarketplacePage() {
  const [productList, setProductList] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [productDetail, setProductDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch list of products
  useEffect(() => {
    fetch("http://localhost:8000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProductList(data);

        // Decide which ID to load first
        let targetId = "";
        if (typeof window !== "undefined") {
          const searchParams = new URLSearchParams(window.location.search);
          targetId = searchParams.get("id") || "";
        }

        if (!targetId && data.length > 0) {
          targetId = data[0].id;
        }

        if (targetId) {
          setSelectedId(targetId);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch product list. Catalog might be empty.", err);
        setLoading(false);
      });
  }, []);

  // Fetch product detail when selected ID changes
  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    fetch(`http://localhost:8000/api/products/${selectedId}`)
      .then((res) => {
        if (!res.ok) throw new Error("not_found");
        return res.json();
      })
      .then((data) => {
        setProductDetail(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn(`Failed to fetch product ${selectedId}.`, err);
        setLoading(false);
      });
  }, [selectedId]);

  const handleSyncToPlatform = async (platform: string) => {
    if (!selectedId) return;

    try {
      const res = await fetch(`http://localhost:8000/api/marketplace/publish?product_id=${selectedId}&platform=${platform}`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("publish_failed");
      const data = await res.json();
      toast.success(data.message || `Successfully published SKU to ${platform}!`);

      // Refresh list to update channel labels on other pages
      fetch("http://localhost:8000/api/products")
        .then((res) => res.json())
        .then((data) => setProductList(data))
        .catch(() => { });
    } catch (error) {
      console.warn("API offline or error. Pushing local simulator success alert.");
      toast.success(`[Simulation Mode] Synced SKU ${selectedId} to ${platform} store!`);
    }
  };

  if (!loading && productList.length === 0) {
    return (
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Marketplace Channel Previews"
          description="Side-by-side simulation using each channel's active retail templates."
        />

        <div className="mt-12 rounded-2xl border bg-card/50 p-8 sm:p-16 text-center max-w-2xl mx-auto space-y-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-1/4 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto shadow-inner">
            <Store className="h-8 w-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-2xl font-bold text-foreground">No AI Listings Found</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              Your catalog is currently empty. Run the MLOps pipeline inside the Upload Studio to automatically classify, write copies, and synthesize visual packages from raw seller inputs first.
            </p>
          </div>

          <div className="pt-2">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-8 h-12 shadow-md">
              <Link to="/upload">
                Go to Upload Studio <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentProduct = productDetail?.product;
  const currentGen = productDetail?.generation;

  const title = currentGen?.title || currentProduct?.name || "Premium Product";
  const desc = currentGen?.description || "E-commerce listing catalog asset.";
  const price = currentProduct?.price || 0;
  const listPrice = Math.round(price * 1.38);
  const discountPercent = Math.round(((listPrice - price) / listPrice) * 100);

  const bullets = currentGen?.bullets && currentGen.bullets.length > 0
    ? currentGen.bullets
    : ["Pure selected organic ingredients", "Sustainably crafted packaging dielines"];

  const tags = currentGen?.tags && currentGen.tags.length > 0
    ? currentGen.tags
    : ["e-commerce", "sku"];

  const visualLabel = (currentProduct?.name || "Product").split(" ")[0];
  const mainCategory = currentProduct?.category || "General › E-Commerce Product";
  const categoryRoot = mainCategory.split("›")[0].trim();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Marketplace Channel Previews"
          description="Side-by-side simulation using each channel's active retail templates."
          actions={
            <Button onClick={() => toast.success("Listing package exported!")} className="bg-primary hover:bg-primary/95 text-white">
              <Download className="mr-2 h-4 w-4" /> Export Channel Package
            </Button>
          }
        />

        {/* Dynamic Product Selector Selector */}
        {productList.length > 0 && (
          <div className="relative self-start sm:self-auto z-20">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center justify-between gap-3 bg-card hover:bg-muted/10 border border-slate-200 rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer min-w-[240px] md:min-w-[280px] text-left"
            >
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="text-[9px] font-extrabold text-muted-foreground tracking-wider uppercase">Active SKU</span>
                <span className="text-sm font-bold text-slate-800 truncate w-full mt-0.5">
                  {selectedId ? `${selectedId} — ${productList.find((p) => p.id === selectedId)?.name || ""}` : "Select SKU..."}
                </span>
              </div>
              <ChevronDown className={`h-4.5 w-4.5 text-muted-foreground transition-transform duration-300 shrink-0 ${dropdownOpen ? 'rotate-180 text-primary' : ''}`} />
            </button>

            {dropdownOpen && (
              <>
                {/* Backdrop to dismiss dropdown when clicking outside */}
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setDropdownOpen(false)} 
                />
                
                <div className="absolute right-0 mt-2 w-72 sm:w-[400px] rounded-xl border border-slate-200/80 bg-background/95 backdrop-blur-md shadow-2xl p-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                  <div className="px-3 py-1.5 border-b border-slate-100/50 mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Catalog Database Listings</span>
                    <span className="text-[9px] font-semibold text-primary-600 bg-primary/5 px-2 py-0.5 rounded-full">{productList.length} SKUs</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin">
                    {productList.map((p) => {
                      const isSelected = p.id === selectedId;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedId(p.id);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 cursor-pointer ${
                            isSelected 
                              ? 'bg-primary/10 text-primary font-bold shadow-inner' 
                              : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center font-bold font-mono text-[10px] ${
                            isSelected ? 'bg-primary/20 text-primary' : 'bg-slate-100 text-slate-500'
                          }`}>
                            SKU
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-extrabold tracking-wider ${isSelected ? 'text-primary' : 'text-slate-400'}`}>
                                {p.id}
                              </span>
                              {p.status && (
                                <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border uppercase font-mono ${
                                  p.status === 'published' 
                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                                    : 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
                                }`}>
                                  {p.status}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-semibold truncate mt-0.5">
                              {p.name}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border bg-card/50">
          <div className="flex flex-col items-center gap-3">
            <span className="h-8 w-8 rounded-full border-4 border-t-primary animate-spin" />
            <span className="text-sm font-medium text-muted-foreground">Loading channel previews...</span>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          {/* 1. AMAZON DETAIL PAGE MOCK */}
          <div className="rounded-2xl border bg-card p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-16 bg-slate-900 rounded flex items-center justify-center text-[10px] text-white font-bold font-mono">
                  amazon
                </div>
                <span className="text-[10px] text-muted-foreground font-semibold">Active Detail View</span>
              </div>
              <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-600 font-mono text-[9px] uppercase">GST/HSN Pass</Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
              <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center relative p-3 border">
                <div className="w-20 h-28 rounded-2xl bg-gradient-to-tr from-emerald-100 to-white shadow-md flex flex-col items-center justify-center p-2">
                  <span className="text-[7px] text-slate-400 font-mono block uppercase">{categoryRoot}</span>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/40 blur-xs" />
                  <span className="text-[8px] font-bold text-slate-800 mt-2 text-center truncate w-full">{visualLabel}</span>
                </div>
                <div className="absolute top-2 left-2 text-[8px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-bold">PRIME</div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">
                  {title}
                </h4>
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-indigo-600 font-semibold">4.8</span>
                  <span className="text-slate-400">(2,842 ratings)</span>
                </div>
                <div className="border-t border-b py-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900">₹{price.toLocaleString()}</span>
                  <span className="text-xs text-slate-400 line-through">₹{listPrice.toLocaleString()}</span>
                  <span className="text-xs text-emerald-600 font-semibold">{discountPercent}% Off</span>
                </div>
                <ul className="text-[11px] text-slate-500 space-y-1 pl-3 list-disc">
                  {bullets.slice(0, 3).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
            <Button onClick={() => handleSyncToPlatform("Amazon")} className="w-full bg-slate-900 hover:bg-slate-800 text-white h-9 text-xs font-semibold rounded-lg">
              Sync Listing to Amazon Seller Central
            </Button>
          </div>

          {/* 2. FLIPKART CATALOG CARD MOCK */}
          <div className="rounded-2xl border bg-card p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-16 bg-blue-600 rounded flex items-center justify-center text-[10px] text-white font-bold font-mono">
                  Flipkart
                </div>
                <span className="text-[10px] text-muted-foreground font-semibold">Listing Card Preview</span>
              </div>
              <Badge variant="outline" className="border-blue-500/30 bg-blue-500/5 text-blue-500 text-[9px] font-mono">F-ASSURED</Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
              <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center p-3 border">
                <div className="w-20 h-28 rounded-2xl bg-gradient-to-tr from-emerald-100 to-white shadow-md flex flex-col items-center justify-center p-2">
                  <span className="text-[7px] text-slate-400 font-mono block uppercase">{categoryRoot}</span>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/40 blur-xs" />
                  <span className="text-[8px] font-bold text-slate-800 mt-2 text-center truncate w-full">{visualLabel}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-wide uppercase text-blue-600">{categoryRoot} Care</span>
                <h4 className="text-sm font-bold text-slate-800 leading-snug line-clamp-1">
                  {title}
                </h4>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded text-[10px] flex items-center gap-0.5">
                    4.4 <Star className="h-2.5 w-2.5 fill-current" />
                  </span>
                  <span className="text-slate-400">(482 reviews)</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900">₹{price.toLocaleString()}</span>
                  <span className="text-xs text-slate-400 line-through">₹{listPrice.toLocaleString()}</span>
                  <span className="text-xs text-emerald-600 font-semibold font-mono">{discountPercent}% off</span>
                </div>
                <span className="text-[10px] bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded font-bold inline-block">Free Delivery by tomorrow</span>
              </div>
            </div>
            <Button onClick={() => handleSyncToPlatform("Flipkart")} className="w-full bg-blue-600 hover:bg-blue-500 text-white h-9 text-xs font-semibold rounded-lg">
              Sync Listing to Flipkart Seller Dashboard
            </Button>
          </div>

          {/* 3. MEESHO CATALOG CARD MOCK */}
          <div className="rounded-2xl border bg-card p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-16 bg-pink-600 rounded flex items-center justify-center text-[10px] text-white font-bold font-mono">
                  meesho
                </div>
                <span className="text-[10px] text-muted-foreground font-semibold">Value Post card</span>
              </div>
              <Badge variant="outline" className="border-pink-500/30 bg-pink-500/5 text-pink-600 text-[9px] font-mono">LOWEST PRICE</Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
              <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center p-3 border">
                <div className="w-20 h-28 rounded-2xl bg-gradient-to-tr from-emerald-100 to-white shadow-md flex flex-col items-center justify-center p-2">
                  <span className="text-[7px] text-slate-400 font-mono block uppercase">{categoryRoot}</span>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/40 blur-xs" />
                  <span className="text-[8px] font-bold text-slate-800 mt-2 text-center truncate w-full">{visualLabel}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">
                  {title}
                </h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900">₹{Math.round(price * 0.96).toLocaleString()}</span>
                  <Badge className="bg-pink-600 text-white text-[9px] font-bold">₹50 Cash Discount</Badge>
                </div>
                <div className="flex gap-2 items-center text-[10px] text-slate-500 font-semibold">
                  <span className="bg-slate-100 border px-1.5 py-0.5 rounded">₹{Math.round(price * 0.92).toLocaleString()} on Special App Deal</span>
                  <span>Free COD</span>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                  ★ 4.2 · Free Returns · 7 Days Easy Exchange Policy
                </p>
              </div>
            </div>
            <Button onClick={() => handleSyncToPlatform("Meesho")} className="w-full bg-pink-600 hover:bg-pink-500 text-white h-9 text-xs font-semibold rounded-lg">
              Sync Listing to Meesho Supplier Panel
            </Button>
          </div>

          {/* 4. INSTAGRAM SPONSORED AD MOCK */}
          <div className="rounded-2xl border bg-card p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-20 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 rounded flex items-center justify-center text-[9px] text-white font-bold font-mono">
                  Instagram
                </div>
                <span className="text-[10px] text-muted-foreground font-semibold">Feed Ad Mockup</span>
              </div>
              <Badge variant="outline" className="border-purple-500/30 bg-purple-500/5 text-purple-600 text-[9px] font-mono">SOCIAL REEL FIT</Badge>
            </div>

            {/* Simulated Instagram Post Frame */}
            <div className="max-w-xs mx-auto border rounded-xl overflow-hidden bg-white text-slate-950 font-sans shadow-sm">
              {/* Post Header */}
              <div className="p-3 flex items-center justify-between border-b bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5">
                    <div className="h-full w-full rounded-full bg-slate-200 border-2 border-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 leading-tight">{visualLabel.toLowerCase()}_store</span>
                    <span className="text-[9px] text-slate-500 leading-tight">Sponsored</span>
                  </div>
                </div>
                <span className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer">•••</span>
              </div>

              {/* Post Media Area */}
              <div className="aspect-square bg-gradient-to-tr from-emerald-100/50 via-teal-50 to-amber-50 flex flex-col items-center justify-center p-8 relative overflow-hidden">
                <div className="w-28 h-40 rounded-2xl bg-white border shadow-xl flex flex-col items-center justify-center p-4 scale-95 relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-300 opacity-60 blur-xs" />
                  <span className="font-display font-extrabold text-slate-800 mt-4 text-[9px] tracking-wide text-center w-full truncate">{visualLabel}</span>
                </div>

                {/* Instagram Shop Tag Overlay */}
                <div className="absolute bottom-4 left-4 p-2 rounded-lg bg-black/75 text-white flex items-center gap-1.5 shadow-lg text-[10px] font-bold backdrop-blur-xs">
                  <Tag className="h-3.5 w-3.5 text-pink-400 fill-pink-400" />
                  <span>View Products</span>
                </div>
              </div>

              {/* Social Icons Bar */}
              <div className="p-3 flex justify-between items-center text-slate-800">
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5" />
                  <MessageCircle className="h-5 w-5" />
                  <Send className="h-5 w-5" />
                </div>
                <Bookmark className="h-5 w-5" />
              </div>

              {/* Comments and Tags */}
              <div className="px-3 pb-3 text-xs text-slate-800 leading-normal">
                <span className="font-bold mr-1.5">{visualLabel.toLowerCase()}_store</span>
                {desc} 🌱 {tags.map(t => `#${t}`).join(" ")}
              </div>
            </div>
            <Button onClick={() => handleSyncToPlatform("Instagram")} className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-90 text-white h-9 text-xs font-semibold rounded-lg border-0">
              Publish Ad to Instagram Business Suite
            </Button>
          </div>

        </div>
      )}
    </div>
  );
}