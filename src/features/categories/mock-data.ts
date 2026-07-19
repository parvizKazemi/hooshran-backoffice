import type { Category, CategoryPayload } from "./types";
import {
  normalizeCategoriesResponse,
  sortCategoriesByOrder,
} from "./utils/category.helpers";

const initialCategories: Category[] = [
  {
    uuid: "11111111-1111-4111-8111-111111111101",
    name: "همه",
    slug: "all",
    order: 1,
    badge: null,
  },
  {
    uuid: "11111111-1111-4111-8111-111111111102",
    name: "بهینه سازی و ویرایش تصویر",
    slug: "image-editing",
    order: 2,
    badge: null,
  },
  {
    uuid: "11111111-1111-4111-8111-111111111103",
    name: "تولید تصویر",
    slug: "image-generation",
    order: 3,
    badge: null,
  },
  {
    uuid: "11111111-1111-4111-8111-111111111104",
    name: "عکاسی و طراحی محصولات",
    slug: "product-photography",
    order: 4,
    badge: null,
  },
  {
    uuid: "11111111-1111-4111-8111-111111111105",
    name: "مد و فشن",
    slug: "fashion",
    order: 5,
    badge: null,
  },
  {
    uuid: "11111111-1111-4111-8111-111111111106",
    name: "مدل های ویدئویی",
    slug: "video-models",
    order: 6,
    badge: null,
  },
  {
    uuid: "11111111-1111-4111-8111-111111111107",
    name: "مدل های صوتی",
    slug: "audio-models",
    order: 7,
    badge: null,
  },
  {
    uuid: "11111111-1111-4111-8111-111111111108",
    name: "گرافیک، چاپ و طراحی",
    slug: "graphic-design-print",
    order: 8,
    badge: null,
  },
  {
    uuid: "11111111-1111-4111-8111-111111111109",
    name: "جعبه ابزار",
    slug: "toolbox",
    order: 9,
    badge: null,
  },
  {
    uuid: "11111111-1111-4111-8111-111111111110",
    name: "بازاریابی و تولید محتوا",
    slug: "marketing-content",
    order: 10,
    badge: "soon",
  },
];

let mockCategoriesStore: Category[] = initialCategories.map((item) => ({
  ...item,
}));

function validatePayload(payload: CategoryPayload[]): void {
  const orders = new Set<number>();
  const slugs = new Set<string>();

  for (const item of payload) {
    if (orders.has(item.order)) {
      throw new Error("شماره ترتیب نمایش تکراری است");
    }
    if (slugs.has(item.slug)) {
      throw new Error("اسلاگ دسته‌بندی تکراری است");
    }
    orders.add(item.order);
    slugs.add(item.slug);
  }
}

function persistPayload(payload: CategoryPayload[]): Category[] {
  validatePayload(payload);

  const now = new Date().toISOString();
  mockCategoriesStore = sortCategoriesByOrder(
    payload.map((item) => ({
      uuid: item.uuid || crypto.randomUUID(),
      name: item.name,
      slug: item.slug,
      order: item.order,
      badge: item.badge,
      isLocal: false,
      createdAt: now,
      updatedAt: now,
    }))
  );

  return normalizeCategoriesResponse(mockCategoriesStore);
}

export function listMockCategories(): Category[] {
  return normalizeCategoriesResponse(mockCategoriesStore);
}

export function saveMockCategories(payload: CategoryPayload[]): Category[] {
  return persistPayload(payload);
}
