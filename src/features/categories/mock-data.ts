import type {
  Category,
  CreateCategoryInput,
  ReorderCategoriesInput,
  UpdateCategoryInput,
} from "./types";

const initialCategories: Category[] = [
  {
    id: "all",
    name: "همه",
    slug: "all",
    order: 1,
    badge: null,
  },
  {
    id: "img-edit",
    name: "بهینه سازی و ویرایش تصویر",
    slug: "image-editing",
    order: 2,
    badge: null,
  },
  {
    id: "img-gen",
    name: "تولید تصویر",
    slug: "image-generation",
    order: 3,
    badge: null,
  },
  {
    id: "products",
    name: "عکاسی و طراحی محصولات",
    slug: "product-photography",
    order: 4,
    badge: null,
  },
  {
    id: "fashion",
    name: "مد و فشن",
    slug: "fashion",
    order: 5,
    badge: null,
  },
  {
    id: "video",
    name: "مدل های ویدئویی",
    slug: "video-models",
    order: 6,
    badge: null,
  },
  {
    id: "audio",
    name: "مدل های صوتی",
    slug: "audio-models",
    order: 7,
    badge: null,
  },
  {
    id: "graphics",
    name: "گرافیک، چاپ و طراحی",
    slug: "graphic-design-print",
    order: 8,
    badge: null,
  },
  {
    id: "toolbox",
    name: "جعبه ابزار",
    slug: "toolbox",
    order: 9,
    badge: null,
  },
  {
    id: "marketing",
    name: "بازاریابی و تولید محتوا",
    slug: "marketing-content",
    order: 10,
    badge: "soon",
  },
];

let mockCategoriesStore: Category[] = initialCategories.map((item) => ({
  ...item,
}));

function sortByOrder(items: Category[]): Category[] {
  return [...items].sort((a, b) => a.order - b.order);
}

function resetOrders(items: Category[]): Category[] {
  return items.map((item, index) => ({
    ...item,
    order: index + 1,
  }));
}

export function listMockCategories(): Category[] {
  return sortByOrder(mockCategoriesStore).map((item) => ({ ...item }));
}

export function createMockCategory(payload: CreateCategoryInput): Category {
  const duplicateOrder = mockCategoriesStore.some(
    (item) => item.order === payload.order
  );
  if (duplicateOrder) {
    throw new Error("شماره ترتیب نمایش تکراری است");
  }

  const created: Category = {
    id: `cat-${Date.now()}`,
    name: payload.name,
    slug: payload.slug,
    order: payload.order,
    badge: payload.badge,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockCategoriesStore = [...mockCategoriesStore, created];
  return { ...created };
}

export function updateMockCategory(payload: UpdateCategoryInput): Category {
  const index = mockCategoriesStore.findIndex((item) => item.id === payload.id);
  const current = mockCategoriesStore[index];
  if (index < 0 || !current) {
    throw new Error("دسته‌بندی یافت نشد");
  }

  const duplicateOrder = mockCategoriesStore.some(
    (item) => item.order === payload.order && item.id !== payload.id
  );
  if (duplicateOrder) {
    throw new Error("شماره ترتیب نمایش تکراری است");
  }

  const updated: Category = {
    id: current.id,
    name: payload.name,
    slug: payload.slug,
    order: payload.order,
    badge: payload.badge,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  };
  mockCategoriesStore = mockCategoriesStore.map((item, i) =>
    i === index ? updated : item
  );
  return { ...updated };
}

export function deleteMockCategory(id: string): void {
  const next = mockCategoriesStore.filter((item) => item.id !== id);
  mockCategoriesStore = resetOrders(sortByOrder(next));
}

export function reorderMockCategories(
  payload: ReorderCategoriesInput
): Category[] {
  const orderMap = new Map(payload.items.map((item) => [item.id, item.order]));
  mockCategoriesStore = sortByOrder(
    mockCategoriesStore.map((item) => ({
      ...item,
      order: orderMap.get(item.id) ?? item.order,
      updatedAt: new Date().toISOString(),
    }))
  );
  return listMockCategories();
}
