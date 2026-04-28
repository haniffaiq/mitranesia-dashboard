import * as React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch, useLocation } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "@/components/protected-route";
import { AuthProvider } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import MerchantsPage from "@/pages/merchants";
import MerchantEditorPage from "@/pages/merchant-editor";
import CarouselsPage from "@/pages/carousels";
import CarouselEditorPage from "@/pages/carousel-editor";
import InsightsPage from "@/pages/insights";
import InsightEditorPage from "@/pages/insight-editor";
import AdminsPage from "@/pages/admins";
import SettingsPage from "@/pages/settings";
import NotFoundPage from "@/pages/not-found";
import { useAuth } from "@/lib/auth";

function HomeRedirect() {
  const { session, isLoading } = useAuth();
  const [, navigate] = useLocation();

  React.useEffect(() => {
    if (!isLoading) {
      navigate(session ? "/dashboard" : "/login", { replace: true });
    }
  }, [isLoading, navigate, session]);

  if (isLoading) return null;
  return null;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/login" component={LoginPage} />
      <Route path="/dashboard">
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/merchants">
        <ProtectedRoute>
          <MerchantsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/merchants/:id">
        <ProtectedRoute>
          <MerchantEditorPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/carousels">
        <ProtectedRoute>
          <CarouselsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/carousels/:id">
        <ProtectedRoute>
          <CarouselEditorPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/insights">
        <ProtectedRoute>
          <InsightsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/insights/:id">
        <ProtectedRoute>
          <InsightEditorPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/admins">
        <ProtectedRoute>
          <AdminsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/settings">
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      </Route>
      <Route>
        <NotFoundPage />
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <AppRoutes />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
