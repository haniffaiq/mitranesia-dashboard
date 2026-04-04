import { useLocation, useParams } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardShell } from "@/components/dashboard-shell";
import { InsightForm } from "@/features/insight-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { dashboardApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function InsightEditorPage() {
  const params = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isNew = params.id === "new" || !params.id;

  const insightQuery = useQuery({
    queryKey: params.id ? queryKeys.insight(params.id) : ["insight", "new"],
    queryFn: () => (params.id ? dashboardApi.getInsight(params.id) : null),
    enabled: !isNew,
  });

  const mutation = useMutation({
    mutationFn: async (values: Parameters<typeof dashboardApi.createInsight>[0]) => {
      if (isNew) {
        return dashboardApi.createInsight(values);
      }
      return dashboardApi.updateInsight(params.id!, values);
    },
    onSuccess: async (insight) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.insights }),
        queryClient.invalidateQueries({ queryKey: queryKeys.overview }),
      ]);
      toast({
        title: isNew ? "Artikel dibuat" : "Artikel diperbarui",
        description: insight.title,
      });
      navigate(`/dashboard/insights/${insight.id}`);
    },
    onError: (error) => {
      toast({
        title: "Gagal menyimpan artikel",
        description: error instanceof Error ? error.message : "Terjadi kesalahan.",
        variant: "destructive",
      });
    },
  });

  return (
    <DashboardShell
      title={isNew ? "Create Insight" : insightQuery.data?.title ?? "Insight Detail"}
      description="Editor artikel insight dengan paragraph array yang siap dikirim ke backend."
    >
      {insightQuery.isLoading ? (
        <Card className="border-border/60">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Memuat detail artikel...
          </CardContent>
        </Card>
      ) : insightQuery.data === null && !isNew ? (
        <Card className="border-border/60">
          <CardContent className="space-y-4 p-6">
            <p className="text-sm text-muted-foreground">Artikel tidak ditemukan.</p>
            <Button variant="outline" onClick={() => navigate("/dashboard/insights")}>
              Kembali
            </Button>
          </CardContent>
        </Card>
      ) : (
        <InsightForm
          insight={insightQuery.data ?? undefined}
          onSubmit={async (values) => {
            await mutation.mutateAsync(values);
          }}
          isPending={mutation.isPending}
        />
      )}
    </DashboardShell>
  );
}
