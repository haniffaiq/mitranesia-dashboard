import * as React from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LoginValues } from "@shared/schema";
import { dashboardApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";

type AuthContextValue = {
  session: Awaited<ReturnType<typeof dashboardApi.getSession>>;
  isLoading: boolean;
  login: (values: LoginValues) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({
    queryKey: queryKeys.auth,
    queryFn: () => dashboardApi.getSession(),
  });

  const loginMutation = useMutation({
    mutationFn: (values: LoginValues) => dashboardApi.login(values),
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.auth, session);
      navigate("/dashboard");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => dashboardApi.logout(),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.auth, null);
      navigate("/login");
    },
  });

  const value = React.useMemo<AuthContextValue>(
    () => ({
      session: sessionQuery.data ?? null,
      isLoading:
        sessionQuery.isLoading || loginMutation.isPending || logoutMutation.isPending,
      login: async (values) => {
        await loginMutation.mutateAsync(values);
      },
      logout: async () => {
        await logoutMutation.mutateAsync();
      },
    }),
    [loginMutation, logoutMutation, sessionQuery.data, sessionQuery.isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
