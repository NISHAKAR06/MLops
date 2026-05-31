import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { PanelLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SidebarState = "expanded" | "collapsed";

type SidebarContextValue = {
  state: SidebarState;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

function SidebarProvider({
  defaultOpen = true,
  children,
}: {
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  const value = React.useMemo<SidebarContextValue>(
    () => ({
      state: open ? "expanded" : "collapsed",
      toggleSidebar: () => setOpen((current) => !current),
    }),
    [open],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

const Sidebar = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { collapsible?: "icon" | "none" }
>(({ className, collapsible = "none", ...props }, ref) => {
  const { state } = useSidebar();
  const collapsed = collapsible === "icon" && state === "collapsed";

  return (
    <aside
      ref={ref}
      data-state={state}
      className={cn(
        "sticky top-0 z-40 flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-16" : "w-64",
        className,
      )}
      {...props}
    />
  );
});
Sidebar.displayName = "Sidebar";

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("shrink-0", className)} {...props} />
  ),
);
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2", className)} {...props} />
  ),
);
SidebarContent.displayName = "SidebarContent";

const SidebarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("grid gap-1", className)} {...props} />
  ),
);
SidebarGroup.displayName = "SidebarGroup";

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { state } = useSidebar();

    if (state === "collapsed") {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn("px-2 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground", className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
SidebarGroupLabel.displayName = "SidebarGroupLabel";

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("grid gap-1", className)} {...props} />
  ),
);
SidebarGroupContent.displayName = "SidebarGroupContent";

const SidebarMenu = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("grid gap-1", className)} {...props} />
  ),
);
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("list-none", className)} {...props} />
  ),
);
SidebarMenuItem.displayName = "SidebarMenuItem";

type SidebarMenuButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string;
};

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ asChild = false, isActive = false, tooltip, className, children, ...props }, ref) => {
    const { state } = useSidebar();
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        title={state === "collapsed" ? tooltip : undefined}
        data-active={isActive}
        className={cn(
          "flex h-9 w-full items-center rounded-md px-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
          state === "collapsed" ? "justify-center [&_span]:sr-only" : "justify-start",
          className,
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
SidebarMenuButton.displayName = "SidebarMenuButton";

function SidebarTrigger({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
    </Button>
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
};
