import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { PageHeader, Section, StatusBadge } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api-base";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products — LaunchOps AI" },
      { name: "description", content: "All products in your LaunchOps AI catalog." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const [productList, setProductList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
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

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Products"
        description={loading ? "Loading catalog..." : `${productList.length} products in your catalog`}
        actions={<Button asChild><Link to="/upload"><Plus className="mr-2 h-4 w-4"/>New product</Link></Button>}
      />
      <Section title="All products" actions={
        <div className="relative w-64"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"/><Input className="h-8 pl-8" placeholder="Search…"/></div>
      }>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-2 py-2">ID</th><th className="px-2 py-2">Product</th><th className="px-2 py-2">Category</th><th className="px-2 py-2">Status</th><th className="px-2 py-2">Marketplaces</th><th className="px-2 py-2">Price</th><th className="px-2 py-2">Updated</th></tr>
            </thead>
            <tbody>
              {productList.map(p=>(
                <tr key={p.id} className="border-t">
                  <td className="px-2 py-3 font-mono text-xs text-muted-foreground">{p.id}</td>
                  <td className="px-2 py-3 font-medium">{p.name}</td>
                  <td className="px-2 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-2 py-3"><StatusBadge status={p.status==="draft"?"warn":p.status==="generated"?"ok":"pass"}/></td>
                  <td className="px-2 py-3 text-xs text-muted-foreground">{p.marketplaces.join(" · ") || "—"}</td>
                  <td className="px-2 py-3 tabular-nums">₹{p.price.toLocaleString()}</td>
                  <td className="px-2 py-3 text-muted-foreground">{p.updated}</td>
                </tr>
              ))}
              {!loading && productList.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-muted-foreground">No products registered in the database yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}