import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  assignCategoriesToService,
  createPrompt,
  createPromptCategory,
  deletePrompt,
  deletePromptCategory,
  fetchPlatformServices,
  fetchPromptCategories,
  fetchPromptsByCategory,
  fetchServiceAssignments,
  updatePrompt,
  updatePromptCategory,
} from "../api/service";
import type {
  AssignCategoriesPayload,
  CreatePromptCategoryPayload,
  EditablePromptOption,
  PromptStatus,
  UpdatePromptCategoryPayload,
} from "../types";
import { PROMPT_STATUS } from "../constants";
import {
  buildPromptOptionPayload,
  isSamePromptOption,
} from "../utils/prompt-assistant.helpers";

export const promptCategoriesQueryKey = [
  "prompt-assistant-categories",
] as const;
export const promptsByCategoryQueryKey = (categoryUuid: string) =>
  ["prompt-assistant-prompts", categoryUuid] as const;
export const serviceAssignmentsQueryKey = [
  "prompt-assistant-service-assignments",
] as const;
export const platformServicesQueryKey = [
  "prompt-assistant-platform-services",
] as const;

export function usePromptCategories() {
  return useQuery({
    queryKey: promptCategoriesQueryKey,
    queryFn: fetchPromptCategories,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function usePromptsByCategory(categoryUuid: string | undefined) {
  return useQuery({
    queryKey: promptsByCategoryQueryKey(categoryUuid ?? "unknown"),
    queryFn: () => fetchPromptsByCategory(categoryUuid ?? ""),
    enabled: Boolean(categoryUuid),
    refetchOnWindowFocus: false,
  });
}

export function useCreatePromptCategory() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePromptCategoryPayload) =>
      createPromptCategory(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: promptCategoriesQueryKey,
      });
      toast.success(t("promptAssistant.toasts.categoryCreated"));
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t("promptAssistant.toasts.categoryCreateFailed")
      );
    },
  });
}

export function useUpdatePromptCategory() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uuid,
      payload,
    }: {
      uuid: string;
      payload: UpdatePromptCategoryPayload;
    }) => updatePromptCategory(uuid, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: promptCategoriesQueryKey,
      });
      toast.success(t("promptAssistant.toasts.categoryUpdated"));
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t("promptAssistant.toasts.categoryUpdateFailed")
      );
    },
  });
}

export function useDeletePromptCategory() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => deletePromptCategory(uuid),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: promptCategoriesQueryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: serviceAssignmentsQueryKey,
      });
      toast.success(t("promptAssistant.toasts.categoryDeleted"));
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t("promptAssistant.toasts.categoryDeleteFailed")
      );
    },
  });
}

export function useToggleCategoryStatus() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, status }: { uuid: string; status: PromptStatus }) =>
      updatePromptCategory(uuid, { status }),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: promptCategoriesQueryKey,
      });
      toast.success(
        variables.status === PROMPT_STATUS.ACTIVE
          ? t("promptAssistant.toasts.categoryEnabled")
          : t("promptAssistant.toasts.categoryDisabled")
      );
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t("promptAssistant.toasts.categoryUpdateFailed")
      );
    },
  });
}

export function useSaveCategoryPrompts() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryUuid,
      options,
      baselineOptions,
    }: {
      categoryUuid: string;
      options: EditablePromptOption[];
      baselineOptions: EditablePromptOption[];
    }) => {
      const existingUuids = baselineOptions
        .map((item) => item.uuid)
        .filter((uuid): uuid is string => Boolean(uuid));
      const keptUuids = new Set(
        options
          .map((item) => item.uuid)
          .filter((uuid): uuid is string => Boolean(uuid))
      );
      const toDelete = existingUuids.filter((uuid) => !keptUuids.has(uuid));
      const baselineByUuid = new Map(
        baselineOptions
          .filter((item) => item.uuid)
          .map((item) => [item.uuid as string, item])
      );

      await Promise.all(toDelete.map((uuid) => deletePrompt(uuid)));

      for (const option of options) {
        const payload = buildPromptOptionPayload(option);

        if (!option.uuid) {
          await createPrompt({ categoryUuid, ...payload });
          continue;
        }

        const baseline = baselineByUuid.get(option.uuid);
        if (baseline && isSamePromptOption(option, baseline)) continue;
        await updatePrompt(option.uuid, payload);
      }
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: promptsByCategoryQueryKey(variables.categoryUuid),
      });
      await queryClient.invalidateQueries({
        queryKey: promptCategoriesQueryKey,
      });
      toast.success(t("promptAssistant.toasts.promptsSaved"));
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t("promptAssistant.toasts.promptsSaveFailed")
      );
    },
  });
}

export function useTogglePromptStatus() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uuid,
      status,
    }: {
      uuid: string;
      categoryUuid: string;
      status: PromptStatus;
    }) => updatePrompt(uuid, { status }),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: promptsByCategoryQueryKey(variables.categoryUuid),
      });
      toast.success(
        variables.status === PROMPT_STATUS.ACTIVE
          ? t("promptAssistant.toasts.promptEnabled")
          : t("promptAssistant.toasts.promptDisabled")
      );
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t("promptAssistant.toasts.promptUpdateFailed")
      );
    },
  });
}

export function usePlatformServices() {
  return useQuery({
    queryKey: platformServicesQueryKey,
    queryFn: fetchPlatformServices,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useServiceAssignments() {
  return useQuery({
    queryKey: serviceAssignmentsQueryKey,
    queryFn: fetchServiceAssignments,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useAssignCategoriesToService() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignCategoriesPayload) =>
      assignCategoriesToService(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: serviceAssignmentsQueryKey,
      });
      toast.success(t("promptAssistant.toasts.assignmentSaved"));
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t("promptAssistant.toasts.assignmentSaveFailed")
      );
    },
  });
}
