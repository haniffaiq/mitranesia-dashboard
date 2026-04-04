import { useMemo } from "react";
import { useLocation, useParams } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardShell } from "@/components/dashboard-shell";
import { CarouselForm } from "@/features/carousel-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { dashboardApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CarouselEditorPage() {
  const params = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isNew = params.id === "new" || !params.id;

  const carouselQuery = useQuery({
    queryKey: params.id ? queryKeys.carousel(params.id) : ["carousel", "new"],
    queryFn: () => (params.id ? dashboardApi.getCarousel(params.id) : null),
    enabled: !isNew,
  });

  const mutation = useMutation({
    mutationFn: async (values: Parameters<typeof dashboardApi.createCarousel>[0]) => {
      if (isNew) {
        return dashboardApi.createCarousel(values);
      }
      return dashboardApi.updateCarousel(params.id!, values);
    },
    onSuccess: async (carousel) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.carousels }),
        params.id
          ? queryClient.invalidateQueries({ queryKey: queryKeys.carousel(params.id) })
          : Promise.resolve(),
      ]);
      toast({
        title: isNew ? "Carousel dibuat" : "Carousel diperbarui",
        description: carousel.title,
      });
      navigate(`/dashboard/carousels/${carousel.id}`);
    },
    onError: (error) => {
      toast({
        title: "Gagal menyimpan carousel",
        description: error instanceof Error ? error.message : "Terjadi kesalahan.",
        variant: "destructive",
      });
    },
  });

  const title = useMemo(
    () => (isNew ? "Create Carousel" : carouselQuery.data?.title ?? "Carousel Detail"),
    [carouselQuery.data?.title, isNew],
  );

  return (
    <DashboardShell
      title={title}
      description="Atur konten hero slide, CTA, urutan tampil, dan status aktif carousel."
      actions={
        !isNew && carouselQuery.data ? (
          <Badge variant={carouselQuery.data.isActive ? "default" : "secondary"}>
            {carouselQuery.data.isActive ? "Active" : "Inactive"}
          </Badge>
        ) : null
      }
    >
      {carouselQuery.isLoading ? (
        <Card className="border-border/60">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Memuat detail carousel...
          </CardContent>
        </Card>
      ) : carouselQuery.data === null && !isNew ? (
        <Card className="border-border/60">
          <CardContent className="space-y-4 p-6">
            <p className="text-sm text-muted-foreground">Carousel tidak ditemukan.</p>
            <Button variant="outline" onClick={() => navigate("/dashboard/carousels")}>
              Kembali
            </Button>
          </CardContent>
        </Card>
      ) : (
        <CarouselForm
          carousel={carouselQuery.data ?? undefined}
          onSubmit={async (values) => {
            await mutation.mutateAsync(values);
          }}
          isPending={mutation.isPending}
        />
      )}
    </DashboardShell>
  );
}
