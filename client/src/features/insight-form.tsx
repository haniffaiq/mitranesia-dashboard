import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { InsightArticleAdmin, InsightFormValues } from "@shared/schema";
import { insightFormSchema, insightStatuses } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageAssetField } from "@/components/image-asset-field";
import { slugify } from "@/lib/utils";

const defaultValues: InsightFormValues = {
  title: "",
  slug: "",
  category: "",
  author: "",
  image: "",
  imageBase64: "",
  excerpt: "",
  readTime: "",
  status: "draft",
  content: [""],
};

function getInsightFormValues(insight?: InsightArticleAdmin | null): InsightFormValues {
  if (!insight) {
    return defaultValues;
  }

  return {
    ...insight,
    imageBase64: insight.imageBase64 ?? "",
  };
}

export function InsightForm({
  insight,
  onSubmit,
  isPending,
}: {
  insight?: InsightArticleAdmin | null;
  onSubmit: (values: InsightFormValues) => Promise<void>;
  isPending: boolean;
}) {
  const form = useForm<InsightFormValues>({
    resolver: zodResolver(insightFormSchema),
    defaultValues: getInsightFormValues(insight),
  });

  useEffect(() => {
    form.reset(getInsightFormValues(insight));
  }, [form, insight]);

  const paragraphs = form.watch("content");

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Insight Article</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Judul</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(event) => {
                        field.onChange(event);
                        if (!insight) {
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
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="readTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Read Time</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="5 min baca" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem className="md:col-span-2">
                  <ImageAssetField
                    label="Cover Insight"
                    urlLabel="https://example.com/insight-cover.jpg"
                    uploadLabel="Upload cover insight"
                    urlValue={form.watch("image")}
                    base64Value={form.watch("imageBase64") ?? ""}
                    error={form.formState.errors.image?.message ?? form.formState.errors.imageBase64?.message}
                    onUrlChange={(value) => {
                      form.setValue("image", value, { shouldValidate: true, shouldDirty: true });
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {insightStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
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
              name="excerpt"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Excerpt</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Konten Artikel</CardTitle>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                form.setValue("content", [...paragraphs, ""], { shouldValidate: true })
              }
            >
              Tambah Paragraf
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {paragraphs.map((_, index) => (
              <div key={index} className="rounded-2xl border border-border/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold">Paragraf {index + 1}</p>
                  {paragraphs.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        form.setValue(
                          "content",
                          paragraphs.filter((_, itemIndex) => itemIndex !== index),
                          { shouldValidate: true },
                        )
                      }
                    >
                      Hapus
                    </Button>
                  ) : null}
                </div>
                <FormField
                  control={form.control}
                  name={`content.${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea rows={5} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan Artikel"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
