import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CarouselFormValues, CarouselItemAdmin } from "@shared/schema";
import { carouselFormSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ImageAssetField } from "@/components/image-asset-field";

const defaultValues: CarouselFormValues = {
  title: "",
  imageUrl: "",
  imageBase64: "",
  tag: "",
  icon: "",
  highlight: "",
  description: "",
  color: "from-primary/95 via-primary/60",
  ctaLabel: "",
  ctaHref: "/merchants",
  sortOrder: 0,
  isActive: true,
};

function getCarouselFormValues(carousel?: CarouselItemAdmin | null): CarouselFormValues {
  if (!carousel) {
    return defaultValues;
  }

  return {
    title: carousel.title,
    imageUrl: carousel.imageUrl,
    imageBase64: carousel.imageBase64 ?? "",
    tag: carousel.tag,
    icon: carousel.icon,
    highlight: carousel.highlight,
    description: carousel.description,
    color: carousel.color,
    ctaLabel: carousel.ctaLabel,
    ctaHref: carousel.ctaHref,
    sortOrder: carousel.sortOrder,
    isActive: carousel.isActive,
  };
}

export function CarouselForm({
  carousel,
  onSubmit,
  isPending,
}: {
  carousel?: CarouselItemAdmin | null;
  onSubmit: (values: CarouselFormValues) => Promise<void>;
  isPending: boolean;
}) {
  const form = useForm<CarouselFormValues>({
    resolver: zodResolver(carouselFormSchema),
    defaultValues: getCarouselFormValues(carousel),
  });

  useEffect(() => {
    form.reset(getCarouselFormValues(carousel));
  }, [carousel, form]);

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Konten Carousel</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="highlight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Highlight</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="trending-up" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={() => (
                <FormItem className="md:col-span-2">
                  <ImageAssetField
                    label="Gambar Carousel"
                    urlLabel="https://example.com/carousel.jpg"
                    uploadLabel="Upload gambar carousel"
                    urlValue={form.watch("imageUrl")}
                    base64Value={form.watch("imageBase64") ?? ""}
                    error={form.formState.errors.imageUrl?.message ?? form.formState.errors.imageBase64?.message}
                    onUrlChange={(value) => {
                      form.setValue("imageUrl", value, { shouldValidate: true, shouldDirty: true });
                      if (value) {
                        form.setValue("imageBase64", "", { shouldValidate: true, shouldDirty: true });
                      }
                    }}
                    onBase64Change={(value) => {
                      form.setValue("imageBase64", value, { shouldValidate: true, shouldDirty: true });
                    }}
                  />
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
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gradient Class</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="from-primary/95 via-primary/60" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ctaLabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CTA Label</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ctaHref"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CTA Href</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="/merchants" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Status slide</p>
                <p className="text-xs text-muted-foreground">
                  Slide nonaktif tidak akan tampil di halaman utama.
                </p>
              </div>
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
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan Carousel"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
