import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signIn, getAuth } from "@/lib/use-auth";
import type { Role } from "@/lib/use-role";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    const a = getAuth();
    if (a.authed) {
      throw redirect({ to: a.role === "admin" ? "/admin" : "/" });
    }
  },
  head: () => ({
    meta: [
      { title: "Sign in — LaunchOps AI" },
      { name: "description", content: "Sign in to the LaunchOps AI multimodal product launch platform." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, mode: "login" | "signup") => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");
    const name = String(fd.get("name") || email.split("@")[0] || "User");
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    const role = getRoleFromCredential(email);
    signIn(role, name);
    toast.success(mode === "login" ? "Welcome back" : "Account created");
    navigate({ to: role === "admin" ? "/admin" : "/" });
  };

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-foreground/10">
            <Layers className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-semibold">LaunchOps AI</span>
        </div>
        <div className="space-y-4">
          <h1 className="font-display text-4xl font-semibold leading-tight">
            Launch products on Amazon, Flipkart & Meesho —{" "}
            <span className="opacity-70">in minutes, not days.</span>
          </h1>
          <p className="max-w-md text-sm opacity-80">
            Multimodal AI for image, video, voice and text. Generates SEO listings,
            visuals, packaging, pricing and compliance — production-grade and MLOps-monitored.
          </p>
          <div className="flex flex-wrap gap-2 pt-4">
            {["YOLOv8", "Whisper", "BERT", "Llama-3", "Gemini", "Stable Diffusion"].map((t) => (
              <span key={t} className="rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-3 py-1 text-xs">
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="text-xs opacity-60">© 2026 LaunchOps AI · Unified Multimodal Platform</div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Layers className="h-4 w-4" />
            </div>
            <span className="font-display text-base font-semibold">LaunchOps AI</span>
          </div>

          <h2 className="font-display text-2xl font-semibold">Welcome</h2>
          <p className="mt-1 text-sm text-muted-foreground">Use your seller or admin credentials to continue.</p>

          <Tabs defaultValue="login" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={(e) => handleSubmit(e, "login")} className="mt-4 space-y-4">
                <Field id="login-email" name="email" label="Email" type="email" placeholder="seller@store.com or admin@launchops.ai" required />
                <Field id="login-password" name="password" label="Password" type="password" placeholder="••••••••" required />
                <Button type="submit" className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Sign in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={(e) => handleSubmit(e, "signup")} className="mt-4 space-y-4">
                <Field id="signup-name" name="name" label="Full name" placeholder="Anika Sharma" required />
                <Field id="signup-email" name="email" label="Email" type="email" placeholder="you@store.com" required />
                <Field id="signup-password" name="password" label="Password" type="password" placeholder="At least 8 characters" required />
                <Button type="submit" className="w-full">
                  Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Demo routing: admin emails open the admin dashboard; other emails open the seller dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ id, name, label, type = "text", placeholder, required }: { id: string; name: string; label: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium">{label}</Label>
      <Input id={id} name={name} type={type} placeholder={placeholder} required={required} />
    </div>
  );
}

function getRoleFromCredential(email: string): Role {
  const normalized = email.toLowerCase();
  if (normalized.startsWith("mlops") || normalized.includes("+mlops") || normalized.includes("mlops@")) {
    return "admin";
  }
  if (normalized.startsWith("admin") || normalized.includes("+admin") || normalized.includes("admin@")) {
    return "admin";
  }
  return "seller";
}
