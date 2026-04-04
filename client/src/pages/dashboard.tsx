import { useQuery } from "@tanstack/react-query";
import { BarChart3, BookOpenText, ShieldCheck, Store } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { dashboardApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";

const kpiIcons = [Store, BarChart3, BookOpenText, ShieldCheck];

export default function DashboardPage() {
  const overviewQuery = useQuery({
    queryKey: queryKeys.overview,
    queryFn: () => dashboardApi.getOverview(),
  });

  const overview = overviewQuery.data;

  return (
    <DashboardShell
      title="Overview"
      description="Snapshot cepat untuk operasional merchant, editorial, dan admin."
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overview
            ? [
                { label: "Total Merchant", value: overview.totals.merchants },
                { label: "Merchant Aktif", value: overview.totals.activeMerchants },
                { label: "Total Insight", value: overview.totals.insights },
                { label: "Admin User", value: overview.totals.admins },
              ].map((item, index) => {
                const Icon = kpiIcons[index];
                return (
                  <Card key={item.label} className="border-border/60 shadow-sm">
                    <CardContent className="flex items-center justify-between p-6">
                      <div>
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className="mt-2 text-3xl font-semibold">{item.value}</p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            : Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="h-32 border-border/60" />
              ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Merchant Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview?.recentMerchants.map((merchant) => (
                    <TableRow key={merchant.id}>
                      <TableCell className="font-medium">{merchant.name}</TableCell>
                      <TableCell>{merchant.category}</TableCell>
                      <TableCell>{merchant.type}</TableCell>
                      <TableCell>
                        <Badge variant={merchant.isActive ? "default" : "secondary"}>
                          {merchant.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(merchant.createdAt ?? merchant.updatedAt ?? "")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle>Distribusi Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {overview?.categoryDistribution.map((item) => (
                  <div key={item.name}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>{item.name}</span>
                      <span className="font-medium">{item.total}</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary">
                      <div
                        className="primary-gradient h-2 rounded-full"
                        style={{ width: `${(item.total / overview.totals.merchants) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle>Distribusi Partnership Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {overview?.typeDistribution.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3"
                  >
                    <span className="text-sm">{item.name}</span>
                    <Badge variant="secondary">{item.total} merchant</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
