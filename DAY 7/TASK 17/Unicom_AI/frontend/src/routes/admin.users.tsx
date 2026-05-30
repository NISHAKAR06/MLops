import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section, StatusBadge } from "@/components/page-header";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Sellers — Admin · LaunchOps AI" }, { name: "description", content: "All sellers on the platform." }] }),
  component: SellersPage,
});

function SellersPage() {
  const [sellerList, setSellerList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        setSellerList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Sellers" description={loading ? "Loading sellers..." : `${sellerList.length} active sellers`} />
      <Section title="All sellers">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-2 py-2">ID</th><th className="px-2 py-2">Seller</th><th className="px-2 py-2">Store</th><th className="px-2 py-2">Plan</th><th className="px-2 py-2">Products</th><th className="px-2 py-2">Status</th><th className="px-2 py-2">Joined</th></tr>
            </thead>
            <tbody>
              {sellerList.map(s=>(
                <tr key={s.id} className="border-t">
                  <td className="px-2 py-3 font-mono text-xs text-muted-foreground">{s.id}</td>
                  <td className="px-2 py-3 font-medium">{s.name}</td>
                  <td className="px-2 py-3">{s.store}</td>
                  <td className="px-2 py-3 text-muted-foreground">{s.plan}</td>
                  <td className="px-2 py-3 tabular-nums">{s.products}</td>
                  <td className="px-2 py-3"><StatusBadge status={s.status==="active"?"pass":s.status==="trial"?"ok":"warn"}/></td>
                  <td className="px-2 py-3 text-muted-foreground">{s.joined}</td>
                </tr>
              ))}
              {!loading && sellerList.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-muted-foreground">No active sellers in database.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}