import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X, Trash2, Star, ShieldCheck } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dashboardApi, type MerchantReviewAdminApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", variant: "secondary" as const },
  { value: "approved", label: "Approved", variant: "default" as const },
  { value: "rejected", label: "Rejected", variant: "destructive" as const },
  { value: "all", label: "Semua" },
];

function StarRow({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={14} fill={i <= value ? "currentColor" : "none"} />
      ))}
      <span className="ml-1 text-xs text-foreground">{value}/5</span>
    </span>
  );
}

export default function ReviewsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("pending");

  const reviewsQ = useQuery({
    queryKey: ["dashboard-reviews", statusFilter],
    queryFn: () => dashboardApi.listMerchantReviews({
      status: statusFilter === "all" ? undefined : statusFilter,
      page_size: 50,
    }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status, verified }: { id: string; status: "approved" | "rejected" | "pending"; verified?: boolean }) =>
      dashboardApi.updateReviewStatus(id, status, verified),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard-reviews"] });
      toast({ title: "Status review diupdate" });
    },
    onError: (e) => toast({ title: "Gagal update", description: String(e), variant: "destructive" }),
  });

  const deleteReview = useMutation({
    mutationFn: (id: string) => dashboardApi.deleteReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard-reviews"] });
      toast({ title: "Review dihapus" });
    },
    onError: (e) => toast({ title: "Gagal hapus", description: String(e), variant: "destructive" }),
  });

  const reviews: MerchantReviewAdminApi[] = reviewsQ.data?.data ?? [];

  return (
    <DashboardShell title="Reviews" description="Moderasi review merchant dari publik. Approved review menambah AggregateRating di SERP.">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Moderasi Review Merchant</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Approve atau reject review yang masuk dari publik. Review approved muncul di SERP via AggregateRating schema.
            </p>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {reviewsQ.isLoading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Memuat review...</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Tidak ada review pada filter ini.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Komentar</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((r) => {
                  const statusOpt = STATUS_OPTIONS.find((o) => o.value === r.status);
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-medium">{r.reviewer_name}</div>
                        {r.reviewer_email && <div className="text-xs text-muted-foreground">{r.reviewer_email}</div>}
                        {r.is_verified_mitra && (
                          <Badge variant="outline" className="mt-1 gap-1 text-[10px]">
                            <ShieldCheck size={10} /> Verified Mitra
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell><StarRow value={r.rating} /></TableCell>
                      <TableCell className="max-w-md text-sm">
                        <p className="line-clamp-3 text-muted-foreground">{r.comment || <em>(no comment)</em>}</p>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{r.merchant_id.slice(0, 8)}…</TableCell>
                      <TableCell>
                        <Badge variant={statusOpt?.variant ?? "outline"}>{statusOpt?.label ?? r.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {r.status !== "approved" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Approve"
                              onClick={() => updateStatus.mutate({ id: r.id, status: "approved" })}
                              disabled={updateStatus.isPending}
                            >
                              <Check size={16} className="text-green-600" />
                            </Button>
                          )}
                          {r.status !== "rejected" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Reject"
                              onClick={() => updateStatus.mutate({ id: r.id, status: "rejected" })}
                              disabled={updateStatus.isPending}
                            >
                              <X size={16} className="text-red-600" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Hapus permanen"
                            onClick={() => {
                              if (confirm("Hapus review ini permanen?")) deleteReview.mutate(r.id);
                            }}
                            disabled={deleteReview.isPending}
                          >
                            <Trash2 size={16} className="text-muted-foreground" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
