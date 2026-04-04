import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export const queryKeys = {
  auth: ["auth"] as const,
  merchants: ["merchants"] as const,
  merchant: (id: string) => ["merchant", id] as const,
  carousels: ["carousels"] as const,
  carousel: (id: string) => ["carousel", id] as const,
  insights: ["insights"] as const,
  insight: (id: string) => ["insight", id] as const,
  admins: ["admins"] as const,
  overview: ["overview"] as const,
};
