import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { MerchantAdmin, MerchantFormValues } from "@shared/schema";
import { merchantFormSchema, partnershipTypes } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { ImageAssetField } from "@/components/image-asset-field";
import { parseTags, slugify } from "@/lib/utils";

const defaultValues: MerchantFormValues = {
  name: "",
  slug: "",
  category: "",
  type: "Self Managed",
  logoUrl: "",
  logoBase64: "",
  bepMonths: 12,
  rating: null,
  isActive: true,
  isTopMerchant: false,
  isOfficialPartner: false,
  description: "",
  tags: [],
  packages: [
    {
      id: "pkg-1",
      name: "",
      price: 0,
      description: "",
    },
  ],
};

function getMerchantFormValues(merchant?: MerchantAdmin | null): MerchantFormValues {
  if (!merchant) {
    return defaultValues;
  }

  return {
    ...merchant,
    rating: merchant.rating ?? null,
    description: merchant.description ?? "",
    logoBase64: merchant.logoBase64 ?? "",
    tags: merchant.tags ?? [],
  };
}

export function MerchantForm({
  merchant,
  onSubmit,
  isPending,
}: {
  merchant?: MerchantAdmin | null;
  onSubmit: (values: MerchantFormValues) => Promise<void>;
  isPending: boolean;
}) {
  const form = useForm<MerchantFormValues>({
    resolver: zodResolver(merchantFormSchema),
    defaultValues: getMerchantFormValues(merchant),
  });

  useEffect(() => {
    form.reset(getMerchantFormValues(merchant));
  }, [form, merchant]);

  const packages = useFieldArray({
    control: form.control,
    name: "packages",
  });

  return (
    <Form {...form}>
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(async (values) => {
          await onSubmit(values);
        })}
      >
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Informasi Merchant</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(event) => {
                        field.onChange(event);
                        if (!merchant) {
                          form.setValue("slug", slugify(event.target.value), {
                            shouldValidate: true,
                          });
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Partnership</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {partnershipTypes.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logoUrl"
              render={() => (
                <FormItem className="md:col-span-2">
                  <ImageAssetField
                    label="Logo Merchant"
                    urlLabel="https://example.com/logo.png"
                    uploadLabel="Upload logo merchant"
                    urlValue={form.watch("logoUrl")}
                    base64Value={form.watch("logoBase64") ?? ""}
                    error={form.formState.errors.logoUrl?.message ?? form.formState.errors.logoBase64?.message}
                    onUrlChange={(value) => {
                      form.setValue("logoUrl", value, { shouldValidate: true, shouldDirty: true });
                      if (value) {
                        form.setValue("logoBase64", "", { shouldValidate: true, shouldDirty: true });
                      }
                    }}
                    onBase64Change={(value) => {
                      form.setValue("logoBase64", value, { shouldValidate: true, shouldDirty: true });
                    }}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bepMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BEP (bulan)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      value={field.value ?? ""}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value === "" ? null : Number(event.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem className="md:col-span-2">
              <Label>Tags</Label>
              <Input
                value={form.watch("tags").join(", ")}
                onChange={(event) =>
                  form.setValue("tags", parseTags(event.target.value), {
                    shouldValidate: true,
                  })
                }
                placeholder="fnb, high-demand, featured"
              />
              <div className="flex flex-wrap gap-2">
                {form.watch("tags").map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </FormItem>
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-3 md:col-span-2">
              <div>
                <p className="text-sm font-medium">Status merchant</p>
                <p className="text-xs text-muted-foreground">
                  Aktifkan merchant agar muncul sebagai listing live.
                </p>
              </div>
              <div className="flex items-center gap-6">
                <FormField
                  control={form.control}
                  name="isTopMerchant"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormLabel>Top merchant</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isOfficialPartner"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormLabel>Official partner</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormLabel>Active</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Paket Merchant</CardTitle>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                packages.append({
                  id: `pkg-${packages.fields.length + 1}`,
                  name: "",
                  price: 0,
                  description: "",
                })
              }
            >
              Tambah Paket
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {packages.fields.map((item, index) => (
              <div key={item.id} className="rounded-2xl border border-border/60 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold">Paket {index + 1}</p>
                  {packages.fields.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => packages.remove(index)}
                    >
                      Hapus
                    </Button>
                  ) : null}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`packages.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Paket</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`packages.${index}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harga</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`packages.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Deskripsi</FormLabel>
                        <FormControl>
                          <Textarea rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Separator className="mt-4" />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" className="min-w-32" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan Merchant"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
