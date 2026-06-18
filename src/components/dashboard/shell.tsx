import { type ReactNode } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FileText, Briefcase, Mail, BarChart3, Brain,
  Target, LayoutTemplate, User, Settings, LogOut, Moon, Sun, Search, Bell,
} from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/logo";
import { useTheme } from "@/components/theme-provider";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/resumes", label: "My Resumes", icon: FileText },
  { to: "/portfolio", label: "Portfolio", icon: Briefcase },
  { to: "/cover-letters", label: "Cover Letters", icon: Mail },
  { to: "/ats", label: "ATS Analyzer", icon: BarChart3 },
  { to: "/skills", label: "Skill Insights", icon: Brain },
  { to: "/jobs", label: "Job Tracker", icon: Target },
  { to: "/templates", label: "Templates", icon: LayoutTemplate },
] as const;

const FOOTER = [
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function DashboardShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: s => s.location.pathname });
  const { theme, toggle } = useTheme();
  const router = useRouter();

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.navigate({ to: "/auth/login", replace: true });
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-border/60 surface md:flex">
        <div className="p-5">
          <Logo />
        </div>
        <nav className="flex-1 space-y-0.5 px-3">
          {NAV.map(item => {
            const active = path === item.to || path.startsWith(item.to + "/");
            return (
              <Link key={item.to} to={item.to} className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition ${active ? "bg-sidebar-accent text-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"}`}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-0.5 border-t border-border/60 p-3">
          {FOOTER.map(item => {
            const active = path === item.to;
            return (
              <Link key={item.to} to={item.to} className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition ${active ? "bg-sidebar-accent text-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"}`}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <button onClick={toggle} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <button onClick={signOut} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl md:px-6">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search resumes, jobs, templates…" className="h-9 pl-8" />
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9"><Bell className="h-4 w-4" /></Button>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
