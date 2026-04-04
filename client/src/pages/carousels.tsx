import * as React from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Plus, Search, Trash2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { dashboardApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function CarouselsPage() {
  const [search, setSearch] = React.useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const carouselsQuery = useQuery({
    queryKey: queryKeys.carousels,
    queryFn: () => dashboardApi.listCarousels(),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      dashboardApi.toggleCarousel(id, isActive),
    onSuccess: async (carousel) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.carousels });
      toast({
        title: "Status carousel diperbarui",
        description: `${carousel.title} sekarang ${carousel.isActive ? "aktif" : "nonaktif"}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Gagal memperbarui status carousel",
        description: error instanceof Error ? error.message : "Terjadi kesalahan.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dashboardApi.deleteCarousel(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.carousels });
      toast({
        title: "Carousel dihapus",
        description: "Slide berhasil dihapus dari dashboard.",
      });
    },
    onError: (error) => {
      toast({
        title: "Gagal menghapus carousel",
        description: error instanceof Error ? error.message : "Terjadi kesalahan.",
        variant: "destructive",
      });
    },
  });

  const carousels = carouselsQuery.data ?? [];
  const filtered = carousels.filter((carousel) => {
    const keyword = search.toLowerCase();
    return (
      carousel.title.toLowerCase().includes(keyword) ||
      carousel.tag.toLowerCase().includes(keyword) ||
      carousel.icon.toLowerCase().includes(keyword)
    );
  });

  return (
    <DashboardShell
      title="Carousel Management"
      description="Kelola hero carousel untuk homepage Mitra Revamp langsung dari API dashboard."
      actions={
        <Link href="/dashboard/carousels/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Carousel Baru
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari judul, tag, atau icon carousel"
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slide</TableHead>
                  <TableHead>CTA</TableHead>
                  <TableHead>Urutan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((carousel) => (
                  <TableRow key={carousel.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{carousel.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {carousel.tag} · {carousel.icon}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{carousel.ctaLabel}</p>
                        <p className="text-xs text-muted-foreground">{carousel.ctaHref}</p>
                      </div>
                    </TableCell>
                    <TableCell>{carousel.sortOrder}</TableCell>
                    <TableCell>
                      <Badge variant={carousel.isActive ? "default" : "secondary"}>
                        {carousel.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(carousel.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/carousels/${carousel.id}`}>
                          <Button size="sm" variant="outline" className="gap-2">
                            <Eye className="h-4 w-4" />
                            Detail
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            toggleMutation.mutate({
                              id: carousel.id,
                              isActive: !carousel.isActive,
                            })
                          }
                        >
                          {carousel.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus carousel?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Slide <strong>{carousel.title}</strong> akan dihapus permanen.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => deleteMutation.mutate(carousel.id)}
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
