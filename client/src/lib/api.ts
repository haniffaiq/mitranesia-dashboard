import type {
  CarouselFormValues,
  CarouselItemAdmin,
  AdminFormValues,
  AdminUser,
  InsightArticleAdmin,
  InsightFormValues,
  LoginValues,
  MerchantAdmin,
  MerchantFormValues,
} from "@shared/schema";

type DetailResponse<T> = {
  data: T;
};

type ListResponse<T> = {
  data: T[];
  meta: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
};

type AuthUserApi = {
  id: string;
  username: string;
  role: AdminUser["role"];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type MerchantPackageApi = {
  id: string;
  name: string;
  price: number;
  description: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type MerchantApi = {
  id: string;
  name: string;
  slug: string;
  category: string;
  type: MerchantAdmin["type"];
  logo_url: string;
  logo_base64: string | null;
  bep_months: number;
  rating: number | null;
  is_active: boolean;
  is_top_merchant: boolean;
  description: string | null;
  packages: MerchantPackageApi[];
  created_at: string;
  updated_at: string;
};

type InsightApi = {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  image: string;
  image_base64: string | null;
  excerpt: string;
  read_time: string;
  content: string[];
  status: InsightArticleAdmin["status"];
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type CarouselApi = {
  id: string;
  title: string;
  image_url: string;
  image_base64: string | null;
  tag: string;
  icon: string;
  highlight: string;
  description: string;
  color: string;
  cta_label: string;
  cta_href: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type DashboardSummaryApi = {
  total_merchants: number;
  active_merchants: number;
  total_insights: number;
  total_admin_users: number;
  merchant_count_by_category: Array<{ key: string; count: number }>;
  merchant_count_by_type: Array<{ key: string; count: number }>;
  latest_merchants: MerchantApi[];
};

type LoginResponse = {
  access_token: string;
  token_type: string;
  user: AuthUserApi;
};

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "https://api.mitranesia.id/api/dashboard";
const TOKEN_KEY =
  (import.meta.env.VITE_SESSION_TOKEN_KEY as string | undefined) ||
  "mitra-revamp-dashboard-token";

function getStoredToken() {
  return window.sessionStorage.getItem(TOKEN_KEY);
}

function setStoredToken(token: string | null) {
  if (!token) {
    window.sessionStorage.removeItem(TOKEN_KEY);
    return;
  }
  window.sessionStorage.setItem(TOKEN_KEY, token);
}

function toAdminUser(input: AuthUserApi): AdminUser {
  return {
    id: input.id,
    username: input.username,
    role: input.role,
    isActive: input.is_active,
    createdAt: input.created_at,
    updatedAt: input.updated_at,
  };
}

function toMerchant(input: MerchantApi): MerchantAdmin {
  return {
    id: input.id,
    name: input.name,
    slug: input.slug,
    category: input.category,
    type: input.type,
    logoUrl: input.logo_url,
    logoBase64: input.logo_base64 ?? undefined,
    bepMonths: input.bep_months,
    rating: input.rating,
    isActive: input.is_active,
    isTopMerchant: input.is_top_merchant,
    description: input.description ?? undefined,
    packages: input.packages
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        description: item.description,
      })),
    createdAt: input.created_at,
    updatedAt: input.updated_at,
  };
}

function toInsight(input: InsightApi): InsightArticleAdmin {
  return {
    id: input.id,
    title: input.title,
    slug: input.slug,
    category: input.category,
    date: new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(input.published_at ?? input.created_at)),
    author: input.author,
    image: input.image,
    imageBase64: input.image_base64 ?? undefined,
    excerpt: input.excerpt,
    readTime: input.read_time,
    content: input.content,
    status: input.status,
    createdAt: input.created_at,
    updatedAt: input.updated_at,
  };
}

function toCarousel(input: CarouselApi): CarouselItemAdmin {
  return {
    id: input.id,
    title: input.title,
    imageUrl: input.image_url,
    imageBase64: input.image_base64 ?? undefined,
    tag: input.tag,
    icon: input.icon,
    highlight: input.highlight,
    description: input.description,
    color: input.color,
    ctaLabel: input.cta_label,
    ctaHref: input.cta_href,
    sortOrder: input.sort_order,
    isActive: input.is_active,
    createdAt: input.created_at,
    updatedAt: input.updated_at,
  };
}

function toMerchantPayload(values: MerchantFormValues) {
  return {
    name: values.name,
    slug: values.slug,
    category: values.category,
    type: values.type,
    logo_url: values.logoUrl || null,
    logo_base64: values.logoBase64 || null,
    bep_months: values.bepMonths,
    rating: values.rating ?? null,
    is_active: values.isActive,
    is_top_merchant: values.isTopMerchant ?? false,
    description: values.description || null,
    packages: values.packages.map((item, index) => ({
      id: item.id.startsWith("pkg-") ? null : item.id,
      name: item.name,
      price: item.price,
      description: item.description,
      sort_order: index,
    })),
  };
}

function toInsightPayload(values: InsightFormValues) {
  return {
    title: values.title,
    slug: values.slug,
    category: values.category,
    author: values.author,
    image: values.image || null,
    image_base64: values.imageBase64 || null,
    excerpt: values.excerpt,
    read_time: values.readTime,
    content: values.content,
    status: values.status,
  };
}

function toAdminPayload(values: AdminFormValues) {
  return {
    username: values.username,
    role: values.role,
    is_active: values.isActive,
  };
}

function toCarouselPayload(values: CarouselFormValues) {
  return {
    title: values.title,
    image_url: values.imageUrl || null,
    image_base64: values.imageBase64 || null,
    tag: values.tag,
    icon: values.icon,
    highlight: values.highlight,
    description: values.description,
    color: values.color,
    cta_label: values.ctaLabel,
    cta_href: values.ctaHref,
    sort_order: values.sortOrder,
    is_active: values.isActive,
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(init?.headers ?? {});

  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = (await response.json()) as
        | { detail?: string; message?: string; errors?: Record<string, string[]> }
        | undefined;
      message =
        body?.detail ||
        body?.message ||
        Object.values(body?.errors ?? {})
          .flat()
          .join(", ") ||
        message;
    } catch {
      const text = await response.text();
      message = text || message;
    }
    if (response.status === 401) {
      setStoredToken(null);
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const dashboardApi = {
  async login(values: LoginValues) {
    const response = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(values),
    });
    setStoredToken(response.access_token);
    return {
      token: response.access_token,
      user: toAdminUser(response.user),
    };
  },
  async logout() {
    try {
      await apiFetch<{ message: string }>("/auth/logout", { method: "POST" });
    } finally {
      setStoredToken(null);
    }
    return true;
  },
  async getSession() {
    const token = getStoredToken();
    if (!token) {
      return null;
    }
    const response = await apiFetch<DetailResponse<AuthUserApi>>("/auth/me");
    return {
      token,
      user: toAdminUser(response.data),
    };
  },
  async getOverview() {
    const response = await apiFetch<DetailResponse<DashboardSummaryApi>>(
      "/summary",
    );
    return {
      totals: {
        merchants: response.data.total_merchants,
        activeMerchants: response.data.active_merchants,
        insights: response.data.total_insights,
        admins: response.data.total_admin_users,
      },
      categoryDistribution: response.data.merchant_count_by_category.map((item) => ({
        name: item.key,
        total: item.count,
      })),
      typeDistribution: response.data.merchant_count_by_type.map((item) => ({
        name: item.key,
        total: item.count,
      })),
      recentMerchants: response.data.latest_merchants.map(toMerchant),
    };
  },
  async listMerchants() {
    const response = await apiFetch<ListResponse<MerchantApi>>(
      "/merchants?page=1&page_size=100",
    );
    return response.data.map(toMerchant);
  },
  async getMerchant(id: string) {
    const response = await apiFetch<DetailResponse<MerchantApi>>(`/merchants/${id}`);
    return toMerchant(response.data);
  },
  async createMerchant(values: MerchantFormValues) {
    const response = await apiFetch<DetailResponse<MerchantApi>>("/merchants", {
      method: "POST",
      body: JSON.stringify(toMerchantPayload(values)),
    });
    return toMerchant(response.data);
  },
  async updateMerchant(id: string, values: MerchantFormValues) {
    const response = await apiFetch<DetailResponse<MerchantApi>>(`/merchants/${id}`, {
      method: "PUT",
      body: JSON.stringify(toMerchantPayload(values)),
    });
    return toMerchant(response.data);
  },
  async toggleMerchant(id: string, isActive: boolean) {
    const response = await apiFetch<DetailResponse<MerchantApi>>(
      `/merchants/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ is_active: isActive }),
      },
    );
    return toMerchant(response.data);
  },
  async listCarousels() {
    const response = await apiFetch<ListResponse<CarouselApi>>(
      "/carousels?page=1&page_size=100",
    );
    return response.data.map(toCarousel);
  },
  async getCarousel(id: string) {
    const response = await apiFetch<DetailResponse<CarouselApi>>(`/carousels/${id}`);
    return toCarousel(response.data);
  },
  async createCarousel(values: CarouselFormValues) {
    const response = await apiFetch<DetailResponse<CarouselApi>>("/carousels", {
      method: "POST",
      body: JSON.stringify(toCarouselPayload(values)),
    });
    return toCarousel(response.data);
  },
  async updateCarousel(id: string, values: CarouselFormValues) {
    const response = await apiFetch<DetailResponse<CarouselApi>>(`/carousels/${id}`, {
      method: "PUT",
      body: JSON.stringify(toCarouselPayload(values)),
    });
    return toCarousel(response.data);
  },
  async toggleCarousel(id: string, isActive: boolean) {
    const response = await apiFetch<DetailResponse<CarouselApi>>(
      `/carousels/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ is_active: isActive }),
      },
    );
    return toCarousel(response.data);
  },
  async deleteCarousel(id: string) {
    await apiFetch<void>(`/carousels/${id}`, {
      method: "DELETE",
    });
    return true;
  },
  async listInsights() {
    const response = await apiFetch<ListResponse<InsightApi>>(
      "/insights?page=1&page_size=100",
    );
    return response.data.map(toInsight);
  },
  async getInsight(id: string) {
    const response = await apiFetch<DetailResponse<InsightApi>>(`/insights/${id}`);
    return toInsight(response.data);
  },
  async createInsight(values: InsightFormValues) {
    const response = await apiFetch<DetailResponse<InsightApi>>("/insights", {
      method: "POST",
      body: JSON.stringify(toInsightPayload(values)),
    });
    return toInsight(response.data);
  },
  async updateInsight(id: string, values: InsightFormValues) {
    const response = await apiFetch<DetailResponse<InsightApi>>(`/insights/${id}`, {
      method: "PUT",
      body: JSON.stringify(toInsightPayload(values)),
    });
    return toInsight(response.data);
  },
  async updateInsightStatus(id: string, status: InsightArticleAdmin["status"]) {
    const response = await apiFetch<DetailResponse<InsightApi>>(
      `/insights/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
    );
    return toInsight(response.data);
  },
  async listAdmins() {
    const response = await apiFetch<ListResponse<AuthUserApi>>(
      "/admin-users?page=1&page_size=100",
    );
    return response.data.map(toAdminUser);
  },
  async createAdmin(values: AdminFormValues) {
    if (!values.password) {
      throw new Error("Password admin wajib diisi.");
    }
    const response = await apiFetch<DetailResponse<AuthUserApi>>("/admin-users", {
      method: "POST",
      body: JSON.stringify({
        ...toAdminPayload(values),
        password: values.password,
      }),
    });
    return toAdminUser(response.data);
  },
  async updateAdmin(id: string, values: AdminFormValues) {
    const response = await apiFetch<DetailResponse<AuthUserApi>>(`/admin-users/${id}`, {
      method: "PUT",
      body: JSON.stringify(toAdminPayload(values)),
    });
    return toAdminUser(response.data);
  },
  async toggleAdmin(id: string, isActive: boolean) {
    const response = await apiFetch<DetailResponse<AuthUserApi>>(
      `/admin-users/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ is_active: isActive }),
      },
    );
    return toAdminUser(response.data);
  },
  async resetAdminPassword(id: string, newPassword: string) {
    const response = await apiFetch<DetailResponse<AuthUserApi>>(
      `/admin-users/${id}/reset-password`,
      {
        method: "POST",
        body: JSON.stringify({ new_password: newPassword }),
      },
    );
    return {
      user: toAdminUser(response.data),
      temporaryPassword: newPassword,
    };
  },
};
