import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">404</p>
      <h1 className="text-3xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Route ini belum tersedia pada dashboard superadmin.
      </p>
      <Link href="/dashboard">
        <Button>Kembali ke Dashboard</Button>
      </Link>
    </div>
  );
}
