import { z } from "zod";

const imageDataUriPattern = /^data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/;

function isValidImageDataUri(value: string) {
  return imageDataUriPattern.test(value.trim());
}

function hasValue(value?: string | null) {
  return Boolean(value && value.trim().length > 0);
}

export interface User {
  id: string;
  username: string;
  password: string;
}

export interface AdminUser {
  id: string;
  username: string;
  role: "superadmin" | "admin" | "editor";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MerchantPartnershipType =
  | "Self Managed"
  | "Semi-Autopilot"
  | "Full-Autopilot"
  | "Auto Pilot";

export interface MerchantPackage {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface Merchant {
  id: string;
  name: string;
  slug: string;
  category: string;
  type: MerchantPartnershipType;
  logoUrl: string;
  logoBase64?: string;
  bepMonths: number;
  packages: MerchantPackage[];
  rating?: number | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MerchantAdmin extends Merchant {
  isTopMerchant?: boolean;
  isOfficialPartner?: boolean;
  description?: string;
  tags?: string[];
}

export interface InsightArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  date: string;
  author: string;
  image: string;
  imageBase64?: string;
  excerpt: string;
  readTime: string;
  content: string[];
}

export interface InsightArticleAdmin extends InsightArticle {
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface CarouselItemAdmin {
  id: string;
  title: string;
  imageUrl: string;
  imageBase64?: string;
  tag: string;
  icon: string;
  highlight: string;
  description: string;
  color: string;
  ctaLabel: string;
  ctaHref: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const partnershipTypes = [
  "Self Managed",
  "Semi-Autopilot",
  "Full-Autopilot",
  "Auto Pilot",
] as const;

export const adminRoles = ["superadmin", "admin", "editor"] as const;
export const insightStatuses = ["draft", "published", "archived"] as const;

const packageSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Nama paket wajib diisi"),
  price: z.coerce.number().int().positive("Harga harus lebih dari 0"),
  description: z.string().min(1, "Deskripsi paket wajib diisi"),
});

const optionalImageUrlSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || z.string().url().safeParse(value).success, {
    message: "Gambar harus berupa URL valid",
  });

const optionalImageBase64Schema = z
  .string()
  .trim()
  .refine((value) => value === "" || isValidImageDataUri(value), {
    message: "File upload harus berupa data image base64 valid",
  });

export const merchantFormSchema = z.object({
  name: z.string().min(1, "Nama merchant wajib diisi"),
  slug: z
    .string()
    .min(1, "Slug wajib diisi")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug harus lowercase dan kebab-case"),
  category: z.string().min(1, "Kategori wajib diisi"),
  type: z.enum(partnershipTypes),
  logoUrl: optionalImageUrlSchema,
  logoBase64: optionalImageBase64Schema.default(""),
  bepMonths: z.coerce.number().int().positive("BEP harus bilangan positif"),
  rating: z.coerce.number().min(0).max(5).nullable().optional(),
  isActive: z.boolean(),
  isTopMerchant: z.boolean().optional(),
  isOfficialPartner: z.boolean().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  packages: z.array(packageSchema).min(1, "Minimal 1 paket"),
}).superRefine((values, ctx) => {
  if (!hasValue(values.logoUrl) && !hasValue(values.logoBase64)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["logoUrl"],
      message: "Isi logo URL atau upload gambar lokal",
    });
  }
});

export const insightFormSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  slug: z
    .string()
    .min(1, "Slug wajib diisi")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug harus lowercase dan kebab-case"),
  category: z.string().min(1, "Kategori wajib diisi"),
  author: z.string().min(1, "Author wajib diisi"),
  image: optionalImageUrlSchema,
  imageBase64: optionalImageBase64Schema.default(""),
  excerpt: z.string().min(1, "Excerpt wajib diisi"),
  readTime: z.string().min(1, "Read time wajib diisi"),
  status: z.enum(insightStatuses),
  content: z.array(z.string().min(1, "Paragraf tidak boleh kosong")).min(1),
}).superRefine((values, ctx) => {
  if (!hasValue(values.image) && !hasValue(values.imageBase64)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["image"],
      message: "Isi image URL atau upload gambar lokal",
    });
  }
});

export const adminFormSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  role: z.enum(adminRoles),
  isActive: z.boolean(),
  password: z.union([z.string().min(8, "Password minimal 8 karakter"), z.literal("")]).optional(),
});

export const carouselFormSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  imageUrl: optionalImageUrlSchema,
  imageBase64: optionalImageBase64Schema.default(""),
  tag: z.string().min(1, "Tag wajib diisi"),
  icon: z.string().min(1, "Icon wajib diisi"),
  highlight: z.string().min(1, "Highlight wajib diisi"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  color: z.string().min(1, "Warna wajib diisi"),
  ctaLabel: z.string().min(1, "CTA label wajib diisi"),
  ctaHref: z.string().min(1, "CTA href wajib diisi"),
  sortOrder: z.coerce.number().int("Sort order harus bilangan bulat"),
  isActive: z.boolean(),
}).superRefine((values, ctx) => {
  if (!hasValue(values.imageUrl) && !hasValue(values.imageBase64)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["imageUrl"],
      message: "Isi image URL atau upload gambar lokal",
    });
  }
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type MerchantFormValues = z.infer<typeof merchantFormSchema>;
export type InsightFormValues = z.infer<typeof insightFormSchema>;
export type AdminFormValues = z.infer<typeof adminFormSchema>;
export type CarouselFormValues = z.infer<typeof carouselFormSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
