import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCcw } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AdminForm } from "@/features/admin-form";
import { dashboardApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { AdminUser } from "@shared/schema";

function generateTemporaryPassword() {
  return `Admin#${Math.random().toString(36).slice(2, 10)}9`;
}

export default function AdminsPage() {
  const [open, setOpen] = React.useState(false);
  const [selectedAdmin, setSelectedAdmin] = React.useState<AdminUser | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const adminsQuery = useQuery({
    queryKey: queryKeys.admins,
    queryFn: () => dashboardApi.listAdmins(),
  });

  const saveMutation = useMutation({
    mutationFn: async (values: Parameters<typeof dashboardApi.createAdmin>[0]) => {
      if (selectedAdmin) {
        return dashboardApi.updateAdmin(selectedAdmin.id, values);
      }
      return dashboardApi.createAdmin(values);
    },
    onSuccess: async (admin) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.admins }),
        queryClient.invalidateQueries({ queryKey: queryKeys.overview }),
      ]);
      setOpen(false);
      setSelectedAdmin(null);
      toast({
        title: selectedAdmin ? "Admin diperbarui" : "Admin dibuat",
        description: admin.username,
      });
    },
    onError: (error) => {
      toast({
        title: "Gagal menyimpan admin",
        description: error instanceof Error ? error.message : "Terjadi kesalahan.",
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      dashboardApi.toggleAdmin(id, isActive),
    onSuccess: async (admin) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admins });
      toast({
        title: "Status admin diperbarui",
        description: `${admin.username} sekarang ${admin.isActive ? "aktif" : "nonaktif"}.`,
      });
    },
  });

  const resetMutation = useMutation({
    mutationFn: (id: string) =>
      dashboardApi.resetAdminPassword(id, generateTemporaryPassword()),
    onSuccess: (result) => {
      toast({
        title: "Password sementara dibuat",
        description: `${result.user.username}: ${result.temporaryPassword}`,
      });
    },
  });

  return (
    <DashboardShell
      title="Admin Users"
      description="Kelola internal admin, role, status akses, dan reset password UI."
      actions={
        <Dialog
          open={open}
          onOpenChange={(nextOpen) => {
            setOpen(nextOpen);
            if (!nextOpen) setSelectedAdmin(null);
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="gap-2"
              onClick={() => {
                setSelectedAdmin(null);
                setOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Admin Baru
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedAdmin ? "Edit Admin" : "Create Admin"}</DialogTitle>
            </DialogHeader>
            <AdminForm
              admin={selectedAdmin ?? undefined}
              onSubmit={async (values) => {
                await saveMutation.mutateAsync(values);
              }}
              isPending={saveMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      }
    >
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Admin Directory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(adminsQuery.data ?? []).map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.username}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{admin.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={admin.isActive ? "default" : "secondary"}>
                      {admin.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(admin.createdAt)}</TableCell>
                  <TableCell>{formatDate(admin.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedAdmin(admin);
                          setOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            toggleMutation.mutate({
                              id: admin.id,
                              isActive: !admin.isActive,
                            })
                          }
                        >
                          {admin.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2"
                        onClick={() => resetMutation.mutate(admin.id)}
                      >
                        <RefreshCcw className="h-4 w-4" />
                        Reset
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
