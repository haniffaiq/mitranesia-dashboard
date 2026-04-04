import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  return (
    <DashboardShell
      title="Settings"
      description="Slot untuk konfigurasi global dashboard dan integrasi backend berikutnya."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>API Contract Readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Semua resource sudah dipisah ke layer `client/src/lib/api.ts`.</p>
            <p>Query key React Query sudah disusun per resource untuk invalidation yang jelas.</p>
            <Badge variant="secondary">FastAPI contract active</Badge>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Environment Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Auth memakai bearer token pada `sessionStorage` dan validasi lewat `/api/dashboard/auth/me`.</p>
            <p>Konfigurasi frontend dibaca dari `.env`, termasuk `VITE_API_BASE_URL`, token key, dan port dev.</p>
            <Badge>Ready for Python backend wiring</Badge>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
