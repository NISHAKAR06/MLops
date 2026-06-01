import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  Upload,
  ImageIcon,
  Video,
  Store,
  Settings,
  Activity,
  Cpu,
  GitBranch,
  Users,
  SlidersHorizontal,
  Layers,
  HelpCircle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRole } from "@/lib/use-role";

type Item = { title: string; url: string; icon: React.ComponentType<{ className?: string }> };

const sellerGroups: { label: string; items: Item[] }[] = [
  {
    label: "Workspace",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Products", url: "/products", icon: Package },
      { title: "Upload Studio", url: "/upload", icon: Upload },
    ],
  },
  {
    label: "AI Generation",
    items: [
      { title: "AI Image Studio", url: "/visuals", icon: ImageIcon },
      { title: "AI Video Studio", url: "/video", icon: Video },
      { title: "Marketplace Preview", url: "/marketplace", icon: Store },
    ],
  },
  {
    label: "Account",
    items: [{ title: "Settings", url: "/settings", icon: Settings }],
  },
];

const adminGroups: { label: string; items: Item[] }[] = [
  {
    label: "Overview",
    items: [{ title: "Admin Dashboard", url: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "MLOps",
    items: [
      { title: "Monitoring", url: "/admin/mlops", icon: Activity },
      { title: "Models", url: "/admin/models", icon: Cpu },
      { title: "Pipelines", url: "/admin/pipelines", icon: GitBranch },
    ],
  },
  {
    label: "Management",
    items: [
      { title: "Sellers", url: "/admin/users", icon: Users },
      { title: "Platform Settings", url: "/admin/settings", icon: SlidersHorizontal },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [role] = useRole();
  const groups = role === "admin" ? adminGroups : sellerGroups;

  const isActive = (url: string) =>
    url === "/" || url === "/admin" ? pathname === url : pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Layers className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-sm font-semibold">LaunchOps AI</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {role === "admin" ? "Admin Console" : "Seller Workspace"}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}