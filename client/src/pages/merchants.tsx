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
const pageSize = 5;

export default function MerchantsPage() {
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState(ALL);
  const [type, setType] = React.useState(ALL);
  const [status, setStatus] = React.useState(ALL);
  const [page, setPage] = React.useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const merchantsQuery = useQuery({
    queryKey: queryKeys.merchants,
    queryFn: () => dashboardApi.listMerchants(),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      dashboardApi.toggleMerchant(id, isActive),
    onSuccess: (merchant) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.merchants });
      void queryClient.invalidateQueries({ queryKey: queryKeys.overview });
      toast({
        title: "Status merchant diperbarui",
        description: `${merchant.name} sekarang ${merchant.isActive ? "aktif" : "nonaktif"}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Gagal memperbarui merchant",
        description: error instanceof Error ? error.message : "Terjadi kesalahan.",
        variant: "destructive",
      });
    },
  });

  const merchants = merchantsQuery.data ?? [];
  const categories = Array.from(new Set(merchants.map((item) => item.category)));
  const types = Array.from(new Set(merchants.map((item) => item.type)));

  const filtered = merchants.filter((merchant) => {
    const matchSearch =
      merchant.name.toLowerCase().includes(search.toLowerCase()) ||
      merchant.slug.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === ALL || merchant.category === category;
    const matchType = type === ALL || merchant.type === type;
    const matchStatus =
      status === ALL ||
      (status === "active" ? merchant.isActive : !merchant.isActive);
    return matchSearch && matchCategory && matchType && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  React.useEffect(() => {
    setPage(1);
  }, [search, category, type, status]);

  return (
    <DashboardShell
      title="Merchant Management"
      description="Kelola merchant, status live, dan nested package di satu workflow."
      actions={
        <Link href="/dashboard/merchants/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Merchant Baru
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
                placeholder="Cari nama atau slug merchant"
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
            <div className="grid gap-4 md:grid-cols-2">
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Semua type</SelectItem>
                  {types.map((item) => (
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Paket</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((merchant) => (
                  <TableRow key={merchant.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{merchant.name}</p>
                        <p className="text-xs text-muted-foreground">{merchant.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>{merchant.category}</TableCell>
                    <TableCell>{merchant.type}</TableCell>
                    <TableCell>{merchant.packages.length}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {merchant.isOfficialPartner ? (
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50 text-[10px]">Official</Badge>
                        ) : null}
                        {merchant.isTopMerchant ? (
                          <Badge variant="outline" className="text-[10px]">Top</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={merchant.isActive ? "default" : "secondary"}>
                        {merchant.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(merchant.updatedAt ?? merchant.createdAt ?? "")}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/merchants/${merchant.id}`}>
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
                              id: merchant.id,
                              isActive: !merchant.isActive,
                            })
                          }
                        >
                          {merchant.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan {paginated.length} dari {filtered.length} merchant
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={page === 1}
            >
              Prev
            </Button>
            <Button variant="outline" disabled>
              {page} / {totalPages}
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
