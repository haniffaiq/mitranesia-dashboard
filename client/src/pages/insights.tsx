import * as React from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Plus, Search } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { dashboardApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const ALL = "__all__";

export default function InsightsPage() {
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState(ALL);
  const [status, setStatus] = React.useState(ALL);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const insightsQuery = useQuery({
    queryKey: queryKeys.insights,
    queryFn: () => dashboardApi.listInsights(),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: "draft" | "published" | "archived" }) =>
      dashboardApi.updateInsightStatus(id, nextStatus),
    onSuccess: async (insight) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.insights }),
        queryClient.invalidateQueries({ queryKey: queryKeys.overview }),
      ]);
      toast({
        title: "Status artikel diperbarui",
        description: `${insight.title} -> ${insight.status}`,
      });
    },
  });

  const insights = insightsQuery.data ?? [];
  const categories = Array.from(new Set(insights.map((item) => item.category)));

  const filtered = insights.filter((insight) => {
    const matchSearch =
      insight.title.toLowerCase().includes(search.toLowerCase()) ||
      insight.slug.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === ALL || insight.category === category;
    const matchStatus = status === ALL || insight.status === status;
    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <DashboardShell
      title="Insight Management"
      description="Kelola draft, publish, dan archive artikel insight internal."
      actions={
        <Link href="/dashboard/insights/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Insight Baru
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        <Card className="border-border/60">
          <CardContent className="grid gap-4 p-4 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari title atau slug artikel"
                className="pl-9"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Semua category</SelectItem>
                {categories.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Semua status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((insight) => (
                  <TableRow key={insight.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{insight.title}</p>
                        <p className="text-xs text-muted-foreground">{insight.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>{insight.category}</TableCell>
                    <TableCell>{insight.author}</TableCell>
                    <TableCell>
                      <Badge variant={insight.status === "published" ? "default" : "secondary"}>
                        {insight.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(insight.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/insights/${insight.id}`}>
                          <Button size="sm" variant="outline" className="gap-2">
                            <Eye className="h-4 w-4" />
                            Detail
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            statusMutation.mutate({
                              id: insight.id,
                              nextStatus:
                                insight.status === "draft"
                                  ? "published"
                                  : insight.status === "published"
                                    ? "archived"
                                    : "draft",
                            })
                          }
                        >
                          Cycle Status
                        </Button>
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
