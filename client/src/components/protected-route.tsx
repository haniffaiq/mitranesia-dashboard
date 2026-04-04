import * as React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";

export function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, isLoading } = useAuth();
  const [, navigate] = useLocation();

  React.useEffect(() => {
    if (!isLoading && !session) {
      navigate("/login");
    }
  }, [isLoading, navigate, session]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="glass-card rounded-2xl px-6 py-4 text-sm text-muted-foreground">
          Loading dashboard session...
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
