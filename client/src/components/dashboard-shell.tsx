import { Link, useLocation } from "wouter";
import {
  Bell,
  BookOpenText,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  ShieldCheck,
  Store,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/merchants", label: "Merchants", icon: Store },
  { href: "/dashboard/carousels", label: "Carousels", icon: Images },
  { href: "/dashboard/insights", label: "Insights", icon: BookOpenText },
  { href: "/dashboard/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/dashboard/admins", label: "Admins", icon: ShieldCheck },
  { href: "/dashboard/trash", label: "Trash", icon: Trash2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function SidebarContent() {
  const [location] = useLocation();
  const { session, logout } = useAuth();

  return (
    <div className="flex h-full flex-col bg-[linear-gradient(180deg,rgba(96,61,32,1),rgba(58,37,22,1))] text-primary-foreground">
      <div className="border-b border-white/10 px-5 py-5">
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">Mitranesia</p>
        <h1 className="mt-2 text-xl font-semibold">Superadmin Panel</h1>
        <p className="mt-2 text-sm text-white/70">
          Signed in as <span className="font-medium text-white">{session?.user.username}</span>
        </p>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              location === item.href ||
              (item.href !== "/dashboard" && location.startsWith(item.href));

            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-white text-primary shadow-lg"
                      : "text-white/75 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </a>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <div className="border-t border-white/10 p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-white hover:bg-white/10 hover:text-white"
          onClick={() => void logout()}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

export function DashboardShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_28%),linear-gradient(180deg,#fdf8f3_0%,#f7efe5_100%)]">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-border/60 md:block">
          <SidebarContent />
        </aside>
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-border/70 bg-background/80 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
              <div className="flex items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild className="md:hidden">
                    <Button variant="outline" size="icon">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 p-0">
                    <SidebarContent />
                  </SheetContent>
                </Sheet>
                <div>
                  <h2 className="text-xl font-semibold text-foreground md:text-2xl">
                    {title}
                  </h2>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {actions}
                <ThemeToggle />
                <Button variant="outline" size="icon" className="rounded-full">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
