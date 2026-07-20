import type { ManageService, ManageServicePayload } from "./types";
import {
  normalizeServicesResponse,
  sortServicesByOrder,
} from "./utils/service.helpers";

const initialServices: ManageService[] = [
  {
    uuid: "22222222-2222-4222-8222-222222222201",
    name: "حذف اشیاء",
    description: "اشیاء، افراد یا متون دلخواه را به صورت جادویی حذف کنید.",
    slug: "remove-objects",
    modelType: "single",
    badge: "popular",
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop",
    order: 1,
    isActive: true,
    inactiveReason: "",
    categoryUuids: ["11111111-1111-4111-8111-111111111102"],
    parentUuid: null,
    isAutoCredit: false,
    creditHint: "۸",
    submodels: [],
  },
  {
    uuid: "22222222-2222-4222-8222-222222222202",
    name: "تغییر پس‌زمینه",
    description: "پس‌زمینه تصاویر را با پرامپت‌های خلاقانه تغییر دهید.",
    slug: "change-background",
    modelType: "single",
    badge: null,
    imageUrl:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop",
    order: 2,
    isActive: true,
    inactiveReason: "",
    categoryUuids: ["11111111-1111-4111-8111-111111111102"],
    parentUuid: null,
    isAutoCredit: false,
    creditHint: "۶",
    submodels: [],
  },
  {
    uuid: "22222222-2222-4222-8222-222222222203",
    name: "حذف پس‌زمینه",
    description: "سوژه اصلی را با دقت پیکسلی از پس‌زمینه جدا کنید.",
    slug: "remove-background",
    modelType: "single",
    badge: "newest",
    imageUrl:
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=400&auto=format&fit=crop",
    order: 3,
    isActive: false,
    inactiveReason: "ارتقا به لایه هوش مصنوعی جدید",
    categoryUuids: ["11111111-1111-4111-8111-111111111102"],
    parentUuid: null,
    isAutoCredit: false,
    creditHint: "۳",
    submodels: [],
  },
  {
    uuid: "22222222-2222-4222-8222-222222222210",
    name: "ادیت لباس (پریمیوم)",
    description: "بالاترین کیفیت ادیت لباس همراه با هماهنگ‌سازی متون فارسی.",
    slug: "models-fashion-premium",
    modelType: "multi",
    badge: "popular",
    imageUrl:
      "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=400&auto=format&fit=crop",
    order: 4,
    isActive: true,
    inactiveReason: "",
    categoryUuids: ["11111111-1111-4111-8111-111111111105"],
    parentUuid: null,
    isAutoCredit: true,
    creditHint: "از ۲",
    submodels: [
      {
        uuid: "33333333-3333-4333-8333-333333333301",
        name: "مدل کتان فشرده",
        description: "رندر چروک البسه",
        slug: "fashion-linen",
        imageUrl:
          "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=400&auto=format&fit=crop",
        creditHint: "۲",
        badge: null,
        isActive: true,
        inactiveReason: "",
      },
      {
        uuid: "33333333-3333-4333-8333-333333333302",
        name: "مدل لوکس مجلسی",
        description: "ادیت بافت‌های نفیس",
        slug: "fashion-luxury",
        imageUrl:
          "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=400&auto=format&fit=crop",
        creditHint: "۶",
        badge: "popular",
        isActive: true,
        inactiveReason: "",
      },
    ],
  },
  {
    uuid: "22222222-2222-4222-8222-222222222211",
    name: "ادیت لباس اورگانا",
    description: "ادیت سریع لباس با بافت کتان و الیاف طبیعی.",
    slug: "fashion-organa",
    modelType: "single",
    badge: null,
    imageUrl:
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=400&auto=format&fit=crop",
    order: 5,
    isActive: true,
    inactiveReason: "",
    categoryUuids: ["11111111-1111-4111-8111-111111111105"],
    parentUuid: "22222222-2222-4222-8222-222222222210",
    isAutoCredit: false,
    creditHint: "۲",
    submodels: [],
  },
  {
    uuid: "22222222-2222-4222-8222-222222222220",
    name: "Grok Image Generator",
    description: "تولید تصاویر فوق سینمایی با هوش مصنوعی Grok 2.",
    slug: "models-grok-image",
    modelType: "multi",
    badge: "newest",
    imageUrl:
      "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=400&auto=format&fit=crop",
    order: 6,
    isActive: true,
    inactiveReason: "",
    categoryUuids: ["11111111-1111-4111-8111-111111111103"],
    parentUuid: null,
    isAutoCredit: false,
    creditHint: "۴",
    submodels: [],
  },
];

let mockServicesStore: ManageService[] = initialServices.map((item) => ({
  ...item,
  categoryUuids: [...item.categoryUuids],
  submodels: item.submodels.map((sub) => ({ ...sub })),
}));

function validatePayload(payload: ManageServicePayload[]): void {
  const orders = new Set<number>();
  const slugs = new Set<string>();

  for (const item of payload) {
    if (orders.has(item.order)) {
      throw new Error("شماره ترتیب نمایش تکراری است");
    }
    if (slugs.has(item.slug)) {
      throw new Error("اسلاگ سرویس تکراری است");
    }
    orders.add(item.order);
    slugs.add(item.slug);
  }
}

export function listMockManageServices(): ManageService[] {
  return normalizeServicesResponse(mockServicesStore);
}

export function saveMockManageServices(
  payload: ManageServicePayload[]
): ManageService[] {
  validatePayload(payload);
  const now = new Date().toISOString();

  mockServicesStore = sortServicesByOrder(
    payload.map((item) => ({
      uuid: item.uuid || crypto.randomUUID(),
      name: item.name,
      description: item.description,
      slug: item.slug,
      modelType: item.modelType,
      badge: item.badge,
      imageUrl: item.imageUrl,
      order: item.order,
      isActive: item.isActive,
      inactiveReason: item.inactiveReason,
      categoryUuids: [...item.categoryUuids],
      parentUuid: item.parentUuid,
      isAutoCredit: item.isAutoCredit,
      creditHint: item.creditHint,
      isLocal: false,
      createdAt: now,
      updatedAt: now,
      submodels: item.submodels.map((sub) => ({
        uuid: sub.uuid || crypto.randomUUID(),
        name: sub.name,
        description: sub.description,
        slug: sub.slug,
        imageUrl: sub.imageUrl,
        creditHint: sub.creditHint,
        badge: sub.badge,
        isActive: sub.isActive,
        inactiveReason: sub.inactiveReason,
        isLocal: false,
      })),
    }))
  );

  return listMockManageServices();
}
