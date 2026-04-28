import { useQuery } from "@tanstack/react-query";
import { BarChart3, BookOpenText, ShieldCheck, Store } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { dashboardApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";

const PIE_COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#9333ea", "#0ea5e9"];

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
              <CardContent className="h-72">
                {overview ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={overview.categoryDistribution.map((item) => ({ name: item.name, total: item.total }))}
                      margin={{ top: 5, right: 10, left: -10, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        angle={-25}
                        textAnchor="end"
                        interval={0}
                        height={50}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle>Distribusi Partnership Type</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                {overview ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={overview.typeDistribution.map((item) => ({ name: item.name, value: item.total }))}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={80}
                        innerRadius={42}
                        paddingAngle={2}
                        label={(entry) => `${entry.value}`}
                      >
                        {overview.typeDistribution.map((_, idx) => (
                          <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
