import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { loginSchema, type LoginValues } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const defaultUsername =
    (import.meta.env.VITE_DEFAULT_LOGIN_USERNAME as string | undefined) || "superadmin";
  const defaultPassword =
    (import.meta.env.VITE_DEFAULT_LOGIN_PASSWORD as string | undefined) || "superadmin123";
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: defaultUsername,
      password: defaultPassword,
    },
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.24),transparent_24%),linear-gradient(135deg,#2f1d12_0%,#6a4222_45%,#f2dfca_100%)] px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden text-white lg:block">
          <p className="text-sm uppercase tracking-[0.35em] text-white/60">Internal Panel</p>
          <h1 className="mt-4 max-w-xl text-5xl font-semibold leading-tight">
            Kontrol merchant, insight, dan admin dalam satu dashboard operasional.
          </h1>
          <div className="mt-8 grid max-w-xl gap-4 md:grid-cols-2">
            {[
              "Merchant CRUD dengan nested package editor",
              "Insight editorial workflow: draft, publish, archive",
              "Admin management dan reset password UI",
              "Overview KPI untuk operasional harian",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <ShieldCheck className="mb-3 h-5 w-5 text-amber-300" />
                <p className="text-sm text-white/80">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="glass-card mx-auto w-full max-w-md border-white/10 shadow-2xl">
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <CardTitle>Admin Login</CardTitle>
            <p className="text-sm text-muted-foreground">
              Gunakan kredensial default backend untuk masuk ke dashboard.
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(async (values) => {
                  try {
                    await login(values);
                    toast({
                      title: "Login berhasil",
                      description: "Session admin aktif.",
                    });
                  } catch (error) {
                    toast({
                      title: "Login gagal",
                      description:
                        error instanceof Error ? error.message : "Terjadi kesalahan.",
                      variant: "destructive",
                    });
                  }
                })}
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button className="w-full" disabled={isLoading}>
                  {isLoading ? "Memproses..." : "Masuk ke Dashboard"}
                </Button>
              </form>
            </Form>
            <p className="mt-4 text-xs text-muted-foreground">
              Default login: <span className="font-medium">{defaultUsername} / {defaultPassword}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
