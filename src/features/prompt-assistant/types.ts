import { z } from "zod";
import {
  PROMPT_DISPLAY_KIND,
  PROMPT_DISPLAY_KIND_FILTER,
  PROMPT_DISPLAY_TYPE,
  PROMPT_STATUS,
} from "./constants";

export type PromptStatus = (typeof PROMPT_STATUS)[keyof typeof PROMPT_STATUS];

export type PromptDisplayType =
  (typeof PROMPT_DISPLAY_TYPE)[keyof typeof PROMPT_DISPLAY_TYPE];

export type PromptDisplayKind =
  (typeof PROMPT_DISPLAY_KIND)[keyof typeof PROMPT_DISPLAY_KIND];

export type PromptDisplayKindFilter =
  (typeof PROMPT_DISPLAY_KIND_FILTER)[keyof typeof PROMPT_DISPLAY_KIND_FILTER];

export type PageMeta = {
  page: number;
  take: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type PageResult<T> = {
  data: T[];
  meta: PageMeta;
};

export type PromptCategory = {
  uuid: string;
  title: string;
  icon: string | null;
  systemKey: string | null;
  status: PromptStatus;
  tags: string[];
  promptsCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type PromptItem = {
  uuid: string;
  promptCategoryUuid?: string;
  title: string;
  prompt: string;
  pictures: string[];
  filter: string[];
  displayType: PromptDisplayType;
  status: PromptStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type ServicePromptAssignment = {
  uuid: string;
  serviceUuid: string;
  serviceName: string;
  categoryUuid: string;
  categoryTitle: string;
  priority: number;
  createdAt?: string;
};

export type PlatformServiceOption = {
  uuid: string;
  name: string;
  slug: string;
  isActive: boolean;
};

export type ServiceAssignmentRow = {
  service: PlatformServiceOption;
  assignedCategories: Array<{
    categoryUuid: string;
    categoryTitle: string;
    priority: number;
  }>;
};

export type ServiceCategoryConfigItem = {
  categoryUuid: string;
  title: string;
  icon: string | null;
  systemKey: string | null;
  displayKind: PromptDisplayKind;
  active: boolean;
  priority: number;
};

export type CreatePromptCategoryPayload = {
  title: string;
  icon?: string;
  systemKey?: string;
  status?: PromptStatus;
  tags?: string[];
};

export type UpdatePromptCategoryPayload = Partial<CreatePromptCategoryPayload>;

export type CreatePromptPayload = {
  categoryUuid: string;
  title: string;
  prompt: string;
  pictures?: string[];
  filter?: string[];
  displayType?: PromptDisplayType;
  status?: PromptStatus;
};

export type UpdatePromptPayload = Partial<
  Omit<CreatePromptPayload, "categoryUuid">
> & {
  categoryUuid?: string;
};

export type AssignCategoriesPayload = {
  serviceUuid: string;
  assignments: Array<{
    categoryUuid: string;
    priority: number;
  }>;
};

export type BulkAssignCategoriesPayload = {
  serviceUuids: string[];
  categoryUuids: string[];
};

export const categoryFormSchema = z.object({
  title: z.string().trim().min(1).max(120),
  systemKey: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9_]+$/i, "invalidSystemKey"),
  icon: z.string().trim().max(120).optional().or(z.literal("")),
  displayKind: z.enum([PROMPT_DISPLAY_KIND.PROMPT, PROMPT_DISPLAY_KIND.STYLE]),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export type EditablePromptOption = {
  localId: string;
  uuid?: string;
  title: string;
  prompt: string;
  pictures: string[];
  filter: string[];
  displayType: PromptDisplayType;
  status: PromptStatus;
};
