import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, RotateCcw } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { dashboardApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function TrashPage() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const merchantsQ = useQuery({
    queryKey: ["trash-merchants"],
    queryFn: () => dashboardApi.listTrashedMerchants(),
  });
  const insightsQ = useQuery({
    queryKey: ["trash-insights"],
    queryFn: () => dashboardApi.listTrashedInsights(),
  });

  const restoreMerchant = useMutation({
    mutationFn: (id: string) => dashboardApi.restoreMerchant(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trash-merchants"] });
      qc.invalidateQueries({ queryKey: ["merchants"] });
      toast({ title: "Merchant dipulihkan" });
    },
    onError: (e) => toast({ title: "Gagal restore", description: String(e), variant: "destructive" }),
  });

  const hardDeleteMerchant = useMutation({
    mutationFn: (id: string) => dashboardApi.hardDeleteMerchant(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trash-merchants"] });
      toast({ title: "Merchant terhapus permanen" });
    },
    onError: (e) => toast({ title: "Gagal hapus", description: String(e), variant: "destructive" }),
  });

  const restoreInsight = useMutation({
    mutationFn: (id: string) => dashboardApi.restoreInsight(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trash-insights"] });
      qc.invalidateQueries({ queryKey: ["insights"] });
      toast({ title: "Insight dipulihkan" });
    },
  });

  const hardDeleteInsight = useMutation({
    mutationFn: (id: string) => dashboardApi.hardDeleteInsight(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trash-insights"] });
      toast({ title: "Insight terhapus permanen" });
    },
  });

  return (
    <DashboardShell title="Trash" description="Item yang sudah dihapus — bisa dipulihkan atau dihapus permanen.">
      <Tabs defaultValue="merchants">
        <TabsList>
          <TabsTrigger value="merchants">Merchants ({merchantsQ.data?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="insights">Insights ({insightsQ.data?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="merchants">
          <Card className="border-border/60 mt-4">
            <CardHeader>
              <CardTitle>Trashed Merchants</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(merchantsQ.data ?? []).length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">Trash kosong</TableCell></TableRow>
                  ) : (
                    (merchantsQ.data ?? []).map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>{m.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{m.slug}</TableCell>
                        <TableCell>{m.category}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="sm" variant="outline" onClick={() => restoreMerchant.mutate(m.id)} disabled={restoreMerchant.isPending}>
                            <RotateCcw className="h-3 w-3 mr-1" /> Restore
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => { if (confirm(`Hapus permanen ${m.name}?`)) hardDeleteMerchant.mutate(m.id); }} disabled={hardDeleteMerchant.isPending}>
                            <Trash2 className="h-3 w-3 mr-1" /> Hard delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card className="border-border/60 mt-4">
            <CardHeader>
              <CardTitle>Trashed Insights</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(insightsQ.data ?? []).length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">Trash kosong</TableCell></TableRow>
                  ) : (
                    (insightsQ.data ?? []).map((i) => (
                      <TableRow key={i.id}>
                        <TableCell>{i.title}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{i.slug}</TableCell>
                        <TableCell>{i.status}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="sm" variant="outline" onClick={() => restoreInsight.mutate(i.id)} disabled={restoreInsight.isPending}>
                            <RotateCcw className="h-3 w-3 mr-1" /> Restore
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => { if (confirm(`Hapus permanen "${i.title}"?`)) hardDeleteInsight.mutate(i.id); }} disabled={hardDeleteInsight.isPending}>
                            <Trash2 className="h-3 w-3 mr-1" /> Hard delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
