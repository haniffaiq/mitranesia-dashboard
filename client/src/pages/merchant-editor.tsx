import { useMemo } from "react";
import { useLocation, useParams } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardShell } from "@/components/dashboard-shell";
import { MerchantForm } from "@/features/merchant-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { dashboardApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function MerchantEditorPage() {
  const params = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isNew = params.id === "new" || !params.id;

  const merchantQuery = useQuery({
    queryKey: params.id ? queryKeys.merchant(params.id) : ["merchant", "new"],
    queryFn: () => (params.id ? dashboardApi.getMerchant(params.id) : null),
    enabled: !isNew,
  });

  const mutation = useMutation({
    mutationFn: async (values: Parameters<typeof dashboardApi.createMerchant>[0]) => {
      if (isNew) {
        return dashboardApi.createMerchant(values);
      }
      return dashboardApi.updateMerchant(params.id!, values);
    },
    onSuccess: async (merchant) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.merchants }),
        queryClient.invalidateQueries({ queryKey: queryKeys.overview }),
      ]);
      toast({
        title: isNew ? "Merchant dibuat" : "Merchant diperbarui",
        description: merchant.name,
      });
      navigate(`/dashboard/merchants/${merchant.id}`);
    },
    onError: (error) => {
      toast({
        title: "Gagal menyimpan merchant",
        description: error instanceof Error ? error.message : "Terjadi kesalahan.",
        variant: "destructive",
      });
    },
  });

  const title = useMemo(
    () => (isNew ? "Create Merchant" : merchantQuery.data?.name ?? "Merchant Detail"),
    [isNew, merchantQuery.data?.name],
  );

  return (
    <DashboardShell
      title={title}
      description={
        isNew
          ? "Buat merchant baru dengan struktur data yang siap dihubungkan ke backend."
          : "Edit informasi merchant, package, dan status aktivasi."
      }
      actions={
        !isNew && merchantQuery.data ? (
          <Badge variant={merchantQuery.data.isActive ? "default" : "secondary"}>
            {merchantQuery.data.isActive ? "Active" : "Inactive"}
          </Badge>
        ) : null
      }
    >
      {merchantQuery.isLoading ? (
        <Card className="border-border/60">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Memuat detail merchant...
          </CardContent>
        </Card>
      ) : merchantQuery.data === null && !isNew ? (
        <Card className="border-border/60">
          <CardContent className="space-y-4 p-6">
            <p className="text-sm text-muted-foreground">Merchant tidak ditemukan.</p>
            <Button variant="outline" onClick={() => navigate("/dashboard/merchants")}>
              Kembali
            </Button>
          </CardContent>
        </Card>
      ) : (
        <MerchantForm
          merchant={merchantQuery.data ?? undefined}
          onSubmit={async (values) => {
            await mutation.mutateAsync(values);
          }}
          isPending={mutation.isPending}
        />
      )}
    </DashboardShell>
  );
}
