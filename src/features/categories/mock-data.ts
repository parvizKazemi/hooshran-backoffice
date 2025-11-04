import { Category } from "./types";

export const mockCategories: Category[] = [
  {
    id: "1",
    name: "پردازش تصویر",
    slug: "image-processing",
    description: "سرویس‌های مرتبط با پردازش و تحلیل تصاویر",
    is_active: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T15:30:00Z",
  },
  {
    id: "2",
    name: "پردازش ویدیو",
    slug: "video-processing",
    description: "سرویس‌های مرتبط با پردازش ویدیو",
    is_active: true,
    createdAt: "2024-01-16T11:00:00Z",
    updatedAt: "2024-01-18T14:20:00Z",
  },
  {
    id: "3",
    name: "پردازش متن",
    slug: "text-processing",
    description: "سرویس‌های مرتبط با پردازش و تحلیل متن",
    is_active: true,
    createdAt: "2024-01-17T09:00:00Z",
    updatedAt: "2024-01-19T10:15:00Z",
  },
  {
    id: "4",
    name: "هوش مصنوعی",
    slug: "ai",
    description: "سرویس‌های مبتنی بر هوش مصنوعی",
    is_active: true,
    createdAt: "2024-01-18T12:00:00Z",
    updatedAt: "2024-01-20T09:45:00Z",
  },
  {
    id: "5",
    name: "تبدیل فرمت",
    slug: "format-conversion",
    description: "سرویس‌های تبدیل فرمت فایل‌ها",
    is_active: false,
    createdAt: "2024-01-19T08:00:00Z",
    updatedAt: "2024-01-21T11:30:00Z",
  },
];
