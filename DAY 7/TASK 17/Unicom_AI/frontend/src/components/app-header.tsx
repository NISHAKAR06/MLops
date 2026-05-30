import { Bell, Search, Sun, Moon, LogOut } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth, signOut } from "@/lib/use-auth";
import { useTheme } from "@/lib/use-theme";

export function AppHeader() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [theme, toggleTheme] = useTheme();

  const initials =
    (auth.name || "User")
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "US";

  const onSignOut = () => {
    signOut();
    navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-3 backdrop-blur md:px-6">
      <SidebarTrigger />
      <div className="relative hidden flex-1 md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products, models, sellers…"
          className="h-9 max-w-md pl-9"
        />
      </div>
      <div className="flex-1 md:hidden" />
      <Badge variant="outline" className="hidden sm:inline-flex">
        {auth.role === "admin" ? "Admin" : "Seller"}
      </Badge>
      <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
        <Bell className="h-4 w-4" />
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-destructive" />
      </Button>
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
          {initials}
        </AvatarFallback>
      </Avatar>
      <Button variant="ghost" size="icon" onClick={onSignOut} aria-label="Sign out">
        <LogOut className="h-4 w-4" />
      </Button>
    </header>
  );
}