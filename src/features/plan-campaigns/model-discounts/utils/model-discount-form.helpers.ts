import {
  MODEL_DISCOUNT_DEFAULT_END_TIME,
  MODEL_DISCOUNT_DEFAULT_START_TIME,
} from "../constants";
import type {
  CreateModelDiscountInput,
  ModelDiscount,
  ModelDiscountFormState,
} from "../types";

export const createInitialModelDiscountForm = (): ModelDiscountFormState => ({
  serviceUuid: "",
  modelName: "",
  discountPercentage: 0,
  startsDate: "",
  startsTime: MODEL_DISCOUNT_DEFAULT_START_TIME,
  endsDate: "",
  endsTime: MODEL_DISCOUNT_DEFAULT_END_TIME,
  isActive: true,
  title: "",
  description: "",
  showAsBanner: true,
  bannerTeaser: "",
});

function normalizeTime24(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2})(?::(\d{1,2}))?$/);
  if (!match) return trimmed;

  const hours = Math.min(23, Math.max(0, Number(match[1])));
  const minutes = Math.min(59, Math.max(0, Number(match[2] ?? 0)));
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function isoToDateInput(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isoToTimeInput(value: string): string {
  if (!value) return MODEL_DISCOUNT_DEFAULT_START_TIME;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return MODEL_DISCOUNT_DEFAULT_START_TIME;
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function modelDiscountToFormState(
  discount: ModelDiscount
): ModelDiscountFormState {
  return {
    serviceUuid: discount.service?.uuid ?? "",
    modelName: discount.modelName ?? "",
    discountPercentage: discount.discountPercentage,
    startsDate: isoToDateInput(discount.startsAt),
    startsTime: isoToTimeInput(discount.startsAt),
    endsDate: isoToDateInput(discount.endsAt),
    endsTime: isoToTimeInput(discount.endsAt),
    isActive: discount.isActive,
    title: discount.title ?? "",
    description: discount.description ?? "",
    showAsBanner: discount.showAsBanner ?? false,
    bannerTeaser: discount.bannerTeaser ?? "",
  };
}

function buildDateTimeIso(dateInput: string, timeInput: string): string {
  const normalizedTime = normalizeTime24(timeInput) || "00:00";
  const localDateTime = new Date(`${dateInput}T${normalizedTime}:00`);
  if (Number.isNaN(localDateTime.getTime())) {
    return "";
  }
  return localDateTime.toISOString();
}

export function buildModelDiscountPayload(
  form: ModelDiscountFormState
): CreateModelDiscountInput {
  const startsAt = buildDateTimeIso(form.startsDate, form.startsTime);
  const endsAt = buildDateTimeIso(form.endsDate, form.endsTime);

  return {
    serviceUuid: form.serviceUuid.trim(),
    modelName: form.modelName.trim() || null,
    discountPercentage: Math.min(
      100,
      Math.max(1, Math.round(form.discountPercentage))
    ),
    startsAt,
    endsAt,
    isActive: form.isActive,
    title: form.title.trim() || undefined,
    description: form.description.trim() || undefined,
    showAsBanner: form.showAsBanner,
    bannerTeaser: form.showAsBanner ? form.bannerTeaser.trim() : null,
  };
}

export function validateModelDiscountForm(
  form: ModelDiscountFormState
): string | null {
  if (!form.serviceUuid.trim()) return "serviceRequired";

  const percent = Number(form.discountPercentage);
  if (!Number.isFinite(percent) || percent < 1 || percent > 100) {
    return "discountRangeInvalid";
  }

  if (!form.startsDate) return "startDateRequired";
  if (!form.endsDate) return "endDateRequired";

  const startsAt = new Date(buildDateTimeIso(form.startsDate, form.startsTime));
  const endsAt = new Date(buildDateTimeIso(form.endsDate, form.endsTime));

  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return "dateTimeInvalid";
  }
  if (endsAt.getTime() <= startsAt.getTime()) {
    return "endBeforeStart";
  }

  return null;
}

export function toModelDiscountWindowLabel(
  startsAt: string,
  endsAt: string
): {
  startsLabel: string;
  endsLabel: string;
  status: "upcoming" | "active" | "expired";
} {
  const startDate = new Date(startsAt);
  const endDate = new Date(endsAt);
  const now = Date.now();

  const startsLabel = Number.isNaN(startDate.getTime())
    ? "—"
    : startDate.toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const endsLabel = Number.isNaN(endDate.getTime())
    ? "—"
    : endDate.toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const status =
    Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())
      ? "expired"
      : now < startDate.getTime()
        ? "upcoming"
        : now > endDate.getTime()
          ? "expired"
          : "active";

  return {
    startsLabel,
    endsLabel,
    status,
  };
}
