import { ServicePicker } from "@/components/common/ServicePicker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "@/features/notifications/components/file-uploader";
import { SettingsPageHeader } from "@/features/user-settings/components/settings-page-header";
import { cn } from "@/lib/utils";
import { MediaBlockPreview } from "./components/media-block-preview";
import { normalizeApiConfigToForm } from "./utils/normalize-api-config";
import {
  hasPendingBlobMedia,
  prepareServiceHintPayload,
} from "./utils/prepare-service-hint-payload";
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconChevronDown,
  IconChevronUp,
  IconDeviceFloppy,
  IconFileText,
  IconInfoCircle,
  IconLoader2,
  IconPencil,
  IconPhoto,
  IconPlus,
  IconRefresh,
  IconSparkles,
  IconTrash,
  IconUpload,
  IconVideo,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { EMPTY_SERVICE_HINT_CONFIG, SERVICE_HINT_LIMITS } from "./constants";
import {
  useSaveServiceHintConfig,
  useServiceHintConfig,
  useServiceHintPlatformServices,
} from "./hooks/use-service-hint";
import type {
  ServiceHintBlock,
  ServiceHintConfig,
  ServiceHintSection,
  ServiceHintTipStyle,
} from "./types";

const MARKDOWN_ACTIONS = [
  { key: "bold", label: "B", syntax: "**متن**" },
  { key: "italic", label: "I", syntax: "*متن*" },
  { key: "h3", label: "H3", syntax: "\n### عنوان" },
  { key: "bullet", label: "•", syntax: "\n- مورد" },
  { key: "quote", label: "❝", syntax: "\n> نقل قول" },
] as const;

const TIP_STYLES: Array<{
  value: ServiceHintTipStyle;
  icon: typeof IconInfoCircle;
  className: string;
}> = [
  {
    value: "info",
    icon: IconInfoCircle,
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300",
  },
  {
    value: "warning",
    icon: IconAlertTriangle,
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  },
  {
    value: "success",
    icon: IconCircleCheck,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
];

const createTextBlock = (): ServiceHintBlock => ({ type: "text", value: "" });

const createSectionId = (sections: ServiceHintConfig) => {
  const maxSectionNumber = sections.reduce((max, section) => {
    const match = /^sec-(\d+)$/.exec(section.id);
    const current = match ? Number(match[1]) : 0;
    return current > max ? current : max;
  }, 0);

  return `sec-${maxSectionNumber + 1}`;
};

const cloneConfig = (sections: ServiceHintConfig): ServiceHintConfig =>
  sections.map((section) => structuredClone(section));

const hasHtmlTag = (value: string) =>
  /<[^>]+>/.test(value.replace(/<\/?(?:u|mark|sup|sub)>/gi, ""));

const moveItem = <T,>(items: T[], index: number, direction: 1 | -1): T[] => {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const current = nextItems[index];
  const target = nextItems[nextIndex];
  if (!current || !target) {
    return nextItems;
  }
  nextItems[index] = target;
  nextItems[nextIndex] = current;
  return nextItems;
};

export default function ServiceHintSettings() {
  const { t } = useTranslation("common");
  const { data: services = [], isLoading: isServicesLoading } =
    useServiceHintPlatformServices();
  const [selectedServiceUuid, setSelectedServiceUuid] = useState<string>("");
  const {
    data: configData,
    isLoading: isConfigLoading,
    isError: isConfigError,
    refetch: refetchConfig,
  } = useServiceHintConfig(selectedServiceUuid || undefined);
  const saveMutation = useSaveServiceHintConfig();

  const [sections, setSections] = useState<ServiceHintConfig>(
    structuredClone(EMPTY_SERVICE_HINT_CONFIG)
  );
  const [baselineJson, setBaselineJson] = useState("");
  const [guideMode, setGuideMode] = useState<"create" | "edit">("create");
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [mediaUploadingCount, setMediaUploadingCount] = useState(0);

  useEffect(() => {
    if (services.length > 0 && !selectedServiceUuid) {
      setSelectedServiceUuid(services[0]?.uuid ?? "");
    }
  }, [services, selectedServiceUuid]);

  useEffect(() => {
    setIsEditorReady(false);
  }, [selectedServiceUuid]);

  useEffect(() => {
    if (!selectedServiceUuid || isConfigLoading || configData === undefined) {
      return;
    }

    const { sections: normalized, hasExisting } =
      normalizeApiConfigToForm(configData);
    const nextSections = cloneConfig(normalized);

    setSections(nextSections);
    setBaselineJson(JSON.stringify(nextSections));
    setGuideMode(hasExisting ? "edit" : "create");
    setIsEditorReady(true);
  }, [selectedServiceUuid, configData, isConfigLoading]);

  const activeService = useMemo(
    () => services.find((service) => service.uuid === selectedServiceUuid),
    [selectedServiceUuid, services]
  );

  const isDirty = useMemo(
    () => isEditorReady && JSON.stringify(sections) !== baselineJson,
    [baselineJson, isEditorReady, sections]
  );

  const handleServiceSelect = (serviceUuid: string) => {
    if (serviceUuid === selectedServiceUuid) {
      return;
    }

    if (isDirty && !window.confirm(t("serviceHint.editor.unsavedConfirm"))) {
      return;
    }

    setSelectedServiceUuid(serviceUuid);
  };

  const handleReset = () => {
    if (!isDirty || !baselineJson) {
      return;
    }

    if (!window.confirm(t("serviceHint.editor.resetConfirm"))) {
      return;
    }

    setSections(JSON.parse(baselineJson) as ServiceHintConfig);
  };

  const updateSection = (
    sectionId: string,
    updater: (section: ServiceHintSection) => ServiceHintSection
  ) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? updater(structuredClone(section)) : section
      )
    );
  };

  const updateBlock = (
    sectionId: string,
    blockIndex: number,
    updater: (block: ServiceHintBlock) => ServiceHintBlock
  ) => {
    updateSection(sectionId, (section) => {
      const targetBlock = section.blocks[blockIndex];
      if (!targetBlock) {
        return section;
      }
      const nextBlocks = [...section.blocks];
      nextBlocks[blockIndex] = updater(structuredClone(targetBlock));
      return { ...section, blocks: nextBlocks };
    });
  };

  const addSection = () => {
    setSections((prev) => {
      if (prev.length >= SERVICE_HINT_LIMITS.maxSections) {
        toast.error(
          t("serviceHint.errors.maxSections", {
            max: SERVICE_HINT_LIMITS.maxSections,
          })
        );
        return prev;
      }

      return [
        ...prev,
        {
          id: createSectionId(prev),
          title: t("serviceHint.editor.newSectionTitle"),
          blocks: [createTextBlock()],
        },
      ];
    });
  };

  const deleteSection = (sectionId: string) => {
    setSections((prev) => {
      if (prev.length <= SERVICE_HINT_LIMITS.minSections) {
        toast.error(
          t("serviceHint.errors.minSections", {
            min: SERVICE_HINT_LIMITS.minSections,
          })
        );
        return prev;
      }
      return prev.filter((section) => section.id !== sectionId);
    });
  };

  const addBlock = (sectionId: string, type: ServiceHintBlock["type"]) => {
    updateSection(sectionId, (section) => {
      if (section.blocks.length >= SERVICE_HINT_LIMITS.maxBlocksPerSection) {
        toast.error(
          t("serviceHint.errors.maxBlocks", {
            max: SERVICE_HINT_LIMITS.maxBlocksPerSection,
          })
        );
        return section;
      }

      const nextBlock: ServiceHintBlock =
        type === "text"
          ? { type: "text", value: "" }
          : type === "image"
            ? { type: "image", source: "url", value: "", fileName: "" }
            : type === "video"
              ? { type: "video", source: "iframe", value: "", fileName: "" }
              : { type: "tip", value: "", style: "info" };

      return { ...section, blocks: [...section.blocks, nextBlock] };
    });
  };

  const deleteBlock = (sectionId: string, blockIndex: number) => {
    updateSection(sectionId, (section) => {
      if (section.blocks.length <= SERVICE_HINT_LIMITS.minBlocksPerSection) {
        toast.error(t("serviceHint.errors.minBlocks"));
        return section;
      }

      return {
        ...section,
        blocks: section.blocks.filter((_, index) => index !== blockIndex),
      };
    });
  };

  const moveBlock = (
    sectionId: string,
    blockIndex: number,
    direction: 1 | -1
  ) => {
    updateSection(sectionId, (section) => ({
      ...section,
      blocks: moveItem(section.blocks, blockIndex, direction),
    }));
  };

  const setMediaSource = (
    sectionId: string,
    blockIndex: number,
    source: "url" | "upload" | "iframe"
  ) => {
    updateBlock(sectionId, blockIndex, (block) => {
      if (block.type === "image" && (source === "url" || source === "upload")) {
        return { ...block, source, value: "", fileName: "" };
      }

      if (
        block.type === "video" &&
        (source === "iframe" || source === "upload")
      ) {
        return { ...block, source, value: "", fileName: "" };
      }

      return block;
    });
  };

  const handleMediaUploadingChange = (uploading: boolean) => {
    setMediaUploadingCount((current) =>
      uploading ? current + 1 : Math.max(0, current - 1)
    );
  };

  const insertMarkdown = (
    sectionId: string,
    blockIndex: number,
    syntax: string
  ) => {
    const textareaId = `md-${sectionId}-${blockIndex}`;
    const textarea = document.getElementById(
      textareaId
    ) as HTMLTextAreaElement | null;
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.slice(start, end);
    const value = selectedText ? syntax.replace("متن", selectedText) : syntax;
    const nextText =
      textarea.value.slice(0, start) + value + textarea.value.slice(end);

    updateBlock(sectionId, blockIndex, (block) =>
      block.type === "text" ? { ...block, value: nextText } : block
    );
  };

  const validateConfig = (data: ServiceHintConfig): string | null => {
    if (
      data.length < SERVICE_HINT_LIMITS.minSections ||
      data.length > SERVICE_HINT_LIMITS.maxSections
    ) {
      return t("serviceHint.errors.sectionsRange", {
        min: SERVICE_HINT_LIMITS.minSections,
        max: SERVICE_HINT_LIMITS.maxSections,
      });
    }

    const ids = new Set<string>();
    for (const section of data) {
      if (!/^sec-\d+$/.test(section.id)) {
        return t("serviceHint.errors.invalidSectionId");
      }
      if (ids.has(section.id)) {
        return t("serviceHint.errors.duplicateSectionId");
      }
      ids.add(section.id);

      if (
        section.blocks.length < SERVICE_HINT_LIMITS.minBlocksPerSection ||
        section.blocks.length > SERVICE_HINT_LIMITS.maxBlocksPerSection
      ) {
        return t("serviceHint.errors.blocksRange", {
          min: SERVICE_HINT_LIMITS.minBlocksPerSection,
          max: SERVICE_HINT_LIMITS.maxBlocksPerSection,
          title: section.title,
        });
      }

      for (const block of section.blocks) {
        if (block.type === "text" && hasHtmlTag(block.value)) {
          return t("serviceHint.errors.noHtml");
        }
        if (
          block.type === "tip" &&
          block.value.length > SERVICE_HINT_LIMITS.tipMaxLength
        ) {
          return t("serviceHint.errors.tipLength", {
            max: SERVICE_HINT_LIMITS.tipMaxLength,
          });
        }
      }
    }

    return null;
  };

  const handleSave = async () => {
    if (!selectedServiceUuid) {
      return;
    }

    if (mediaUploadingCount > 0) {
      toast.error(t("serviceHint.errors.uploadInProgress"));
      return;
    }

    if (hasPendingBlobMedia(sections)) {
      toast.error(t("serviceHint.errors.pendingUpload"));
      return;
    }

    const prepared = prepareServiceHintPayload(sections);

    const validationError = validateConfig(prepared);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    await saveMutation.mutateAsync({
      serviceUuid: selectedServiceUuid,
      sections: prepared,
    });

    setBaselineJson(JSON.stringify(sections));
    setGuideMode(prepared.length > 0 ? "edit" : "create");
  };

  const isPageLoading = isServicesLoading;
  const isConfigPending =
    Boolean(selectedServiceUuid) && (isConfigLoading || !isEditorReady);
  const isSaving = saveMutation.isPending || mediaUploadingCount > 0;
  const isEditorDisabled = isSaving || isConfigPending || isConfigError;

  if (isPageLoading && services.length === 0) {
    return (
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <SettingsPageHeader
          title={t("serviceHint.header.title")}
          description={t("serviceHint.header.description")}
        />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <SettingsPageHeader
        title={t("serviceHint.header.title")}
        description={t("serviceHint.header.description")}
      />

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>{t("serviceHint.editor.title")}</CardTitle>
                {isEditorReady && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "gap-1 rounded-lg text-[11px] font-bold",
                      guideMode === "edit"
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                    )}
                  >
                    {guideMode === "edit" ? (
                      <IconPencil className="size-3" />
                    ) : (
                      <IconSparkles className="size-3" />
                    )}
                    {guideMode === "edit"
                      ? t("serviceHint.editor.modeEdit")
                      : t("serviceHint.editor.modeCreate")}
                  </Badge>
                )}
                {isDirty && (
                  <Badge
                    variant="outline"
                    className="border-amber-300 bg-amber-50 text-[11px] font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                  >
                    {t("serviceHint.editor.unsavedChanges")}
                  </Badge>
                )}
              </div>
              <CardDescription>
                {t("serviceHint.editor.description")}
              </CardDescription>
            </div>
            <div className="w-full sm:w-80">
              <Label className="mb-2 block text-xs">
                {t("serviceHint.editor.serviceLabel")}
              </Label>
              <ServicePicker
                services={services}
                selectedUuid={selectedServiceUuid}
                onSelect={handleServiceSelect}
                placeholder={t("serviceHint.editor.servicePlaceholder")}
                title={t("serviceHint.editor.serviceLabel")}
                searchPlaceholder={t(
                  "serviceHint.editor.serviceSearchPlaceholder"
                )}
                emptyMessage={t("serviceHint.editor.noServices")}
                noSearchResultsMessage={t("serviceHint.editor.noSearchResults")}
                disabled={isEditorDisabled}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isConfigError && (
            <div className="border-destructive/30 bg-destructive/5 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2 text-sm">
                <IconAlertCircle className="text-destructive mt-0.5 size-4 shrink-0" />
                <span>{t("serviceHint.errors.loadFailed")}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => refetchConfig()}
              >
                <IconRefresh className="size-4" />
                {t("serviceHint.actions.retry")}
              </Button>
            </div>
          )}

          {isConfigPending && !isConfigError ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-48 rounded-lg" />
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={addSection}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isEditorDisabled}
                >
                  <IconPlus className="size-4" />
                  {t("serviceHint.editor.addSection")}
                </Button>
                <span className="text-muted-foreground text-xs">
                  {t("serviceHint.editor.sectionCount", {
                    count: sections.length,
                    service: activeService?.name ?? "-",
                  })}
                </span>
              </div>

              <div className="space-y-4">
                {sections.map((section, sectionIndex) => (
                  <section key={section.id} className="rounded-xl border">
                    <div className="bg-muted/40 flex flex-wrap items-center gap-2 border-b p-3">
                      <span className="bg-primary/10 text-primary rounded-md px-2 py-1 text-xs font-bold">
                        {section.id}
                      </span>
                      <Input
                        value={section.title}
                        onChange={(event) =>
                          updateSection(section.id, (current) => ({
                            ...current,
                            title: event.target.value,
                          }))
                        }
                        placeholder={t(
                          "serviceHint.editor.sectionTitlePlaceholder"
                        )}
                        className="h-9 max-w-sm"
                        disabled={isEditorDisabled}
                      />
                      <div className="ms-auto flex items-center gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          disabled={sectionIndex === 0 || isEditorDisabled}
                          onClick={() =>
                            setSections((prev) =>
                              moveItem(prev, sectionIndex, -1)
                            )
                          }
                        >
                          <IconChevronUp className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          disabled={
                            sectionIndex === sections.length - 1 ||
                            isEditorDisabled
                          }
                          onClick={() =>
                            setSections((prev) =>
                              moveItem(prev, sectionIndex, 1)
                            )
                          }
                        >
                          <IconChevronDown className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => deleteSection(section.id)}
                          disabled={isEditorDisabled}
                        >
                          <IconTrash className="size-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3 p-3">
                      {section.blocks.map((block, blockIndex) => (
                        <div
                          key={`${section.id}-${blockIndex}`}
                          className="rounded-lg border p-3"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <div className="text-muted-foreground text-xs font-bold">
                              {t(`serviceHint.blocks.${block.type}`)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={blockIndex === 0 || isEditorDisabled}
                                onClick={() =>
                                  moveBlock(section.id, blockIndex, -1)
                                }
                              >
                                <IconChevronUp className="size-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={
                                  blockIndex === section.blocks.length - 1 ||
                                  isEditorDisabled
                                }
                                onClick={() =>
                                  moveBlock(section.id, blockIndex, 1)
                                }
                              >
                                <IconChevronDown className="size-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() =>
                                  deleteBlock(section.id, blockIndex)
                                }
                                disabled={isEditorDisabled}
                              >
                                <IconTrash className="size-4" />
                              </Button>
                            </div>
                          </div>

                          {block.type === "text" && (
                            <div className="space-y-2">
                              <div className="bg-muted flex flex-wrap items-center gap-1 rounded-md border p-1">
                                {MARKDOWN_ACTIONS.map((action) => (
                                  <Button
                                    key={action.key}
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    onClick={() =>
                                      insertMarkdown(
                                        section.id,
                                        blockIndex,
                                        action.syntax
                                      )
                                    }
                                    disabled={isEditorDisabled}
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                              <Textarea
                                id={`md-${section.id}-${blockIndex}`}
                                value={block.value}
                                onChange={(event) =>
                                  updateBlock(
                                    section.id,
                                    blockIndex,
                                    (current) =>
                                      current.type === "text"
                                        ? {
                                            ...current,
                                            value: event.target.value,
                                          }
                                        : current
                                  )
                                }
                                rows={5}
                                className="resize-y"
                                placeholder={t(
                                  "serviceHint.blocks.textPlaceholder"
                                )}
                                disabled={isEditorDisabled}
                              />
                            </div>
                          )}

                          {block.type === "image" && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setMediaSource(
                                      section.id,
                                      blockIndex,
                                      "url"
                                    )
                                  }
                                  disabled={isEditorDisabled}
                                  className={cn(
                                    "h-8 text-xs",
                                    block.source === "url" &&
                                      "border-primary text-primary"
                                  )}
                                >
                                  URL
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setMediaSource(
                                      section.id,
                                      blockIndex,
                                      "upload"
                                    )
                                  }
                                  disabled={isEditorDisabled}
                                  className={cn(
                                    "h-8 text-xs",
                                    block.source === "upload" &&
                                      "border-primary text-primary"
                                  )}
                                >
                                  <IconUpload className="size-3.5" />
                                  {t("serviceHint.blocks.upload")}
                                </Button>
                              </div>
                              {block.source === "upload" ? (
                                <FileUploader
                                  value={block.value}
                                  accept="image/*"
                                  showUrlInput={false}
                                  compressImages
                                  disabled={isEditorDisabled}
                                  onUploadingChange={handleMediaUploadingChange}
                                  onChange={(url) =>
                                    updateBlock(
                                      section.id,
                                      blockIndex,
                                      (current) =>
                                        current.type === "image"
                                          ? {
                                              ...current,
                                              source: "upload",
                                              value: url,
                                              fileName: "",
                                            }
                                          : current
                                    )
                                  }
                                />
                              ) : (
                                <Input
                                  value={block.value}
                                  onChange={(event) =>
                                    updateBlock(
                                      section.id,
                                      blockIndex,
                                      (current) =>
                                        current.type === "image"
                                          ? {
                                              ...current,
                                              value: event.target.value,
                                            }
                                          : current
                                    )
                                  }
                                  placeholder={t(
                                    "serviceHint.blocks.imagePlaceholder"
                                  )}
                                  dir="ltr"
                                  disabled={isEditorDisabled}
                                />
                              )}
                              <MediaBlockPreview
                                type="image"
                                url={block.value}
                              />
                              <p className="text-muted-foreground text-xs">
                                {t("serviceHint.blocks.imageHint")}
                              </p>
                            </div>
                          )}

                          {block.type === "video" && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setMediaSource(
                                      section.id,
                                      blockIndex,
                                      "iframe"
                                    )
                                  }
                                  disabled={isEditorDisabled}
                                  className={cn(
                                    "h-8 text-xs",
                                    block.source === "iframe" &&
                                      "border-primary text-primary"
                                  )}
                                >
                                  URL / iframe
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setMediaSource(
                                      section.id,
                                      blockIndex,
                                      "upload"
                                    )
                                  }
                                  disabled={isEditorDisabled}
                                  className={cn(
                                    "h-8 text-xs",
                                    block.source === "upload" &&
                                      "border-primary text-primary"
                                  )}
                                >
                                  <IconUpload className="size-3.5" />
                                  {t("serviceHint.blocks.upload")}
                                </Button>
                              </div>
                              {block.source === "upload" ? (
                                <FileUploader
                                  value={block.value}
                                  accept="video/*"
                                  showUrlInput={false}
                                  disabled={isEditorDisabled}
                                  onUploadingChange={handleMediaUploadingChange}
                                  onChange={(url) =>
                                    updateBlock(
                                      section.id,
                                      blockIndex,
                                      (current) =>
                                        current.type === "video"
                                          ? {
                                              ...current,
                                              source: "upload",
                                              value: url,
                                              fileName: "",
                                            }
                                          : current
                                    )
                                  }
                                />
                              ) : (
                                <Input
                                  value={block.value}
                                  onChange={(event) =>
                                    updateBlock(
                                      section.id,
                                      blockIndex,
                                      (current) =>
                                        current.type === "video"
                                          ? {
                                              ...current,
                                              value: event.target.value,
                                            }
                                          : current
                                    )
                                  }
                                  placeholder={t(
                                    "serviceHint.blocks.videoPlaceholder"
                                  )}
                                  dir="ltr"
                                  disabled={isEditorDisabled}
                                />
                              )}
                              <MediaBlockPreview
                                type="video"
                                url={block.value}
                              />
                              <p className="text-muted-foreground text-xs">
                                {t("serviceHint.blocks.videoHint")}
                              </p>
                            </div>
                          )}

                          {block.type === "tip" && (
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-2">
                                {TIP_STYLES.map((style) => {
                                  const Icon = style.icon;
                                  const isSelected =
                                    block.style === style.value;
                                  return (
                                    <Button
                                      key={style.value}
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      className={cn(
                                        "h-8 border hover:bg-transparent",
                                        isSelected
                                          ? style.className
                                          : "text-muted-foreground"
                                      )}
                                      onClick={() =>
                                        updateBlock(
                                          section.id,
                                          blockIndex,
                                          (current) =>
                                            current.type === "tip"
                                              ? {
                                                  ...current,
                                                  style: style.value,
                                                }
                                              : current
                                        )
                                      }
                                      disabled={isEditorDisabled}
                                    >
                                      <Icon className="size-3.5" />
                                      {t(
                                        `serviceHint.tipStyles.${style.value}`
                                      )}
                                    </Button>
                                  );
                                })}
                              </div>
                              <Input
                                value={block.value}
                                onChange={(event) =>
                                  updateBlock(
                                    section.id,
                                    blockIndex,
                                    (current) =>
                                      current.type === "tip"
                                        ? {
                                            ...current,
                                            value: event.target.value,
                                          }
                                        : current
                                  )
                                }
                                placeholder={t(
                                  "serviceHint.blocks.tipPlaceholder"
                                )}
                                disabled={isEditorDisabled}
                              />
                              <p className="text-muted-foreground text-xs">
                                {t("serviceHint.blocks.tipCounter", {
                                  current: block.value.length,
                                  max: SERVICE_HINT_LIMITS.tipMaxLength,
                                })}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}

                      <div className="flex flex-wrap gap-2 border-t pt-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addBlock(section.id, "text")}
                          disabled={isEditorDisabled}
                        >
                          <IconFileText className="size-4" />
                          {t("serviceHint.blocks.text")}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addBlock(section.id, "image")}
                          disabled={isEditorDisabled}
                        >
                          <IconPhoto className="size-4" />
                          {t("serviceHint.blocks.image")}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addBlock(section.id, "video")}
                          disabled={isEditorDisabled}
                        >
                          <IconVideo className="size-4" />
                          {t("serviceHint.blocks.video")}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addBlock(section.id, "tip")}
                          disabled={isEditorDisabled}
                        >
                          <IconInfoCircle className="size-4" />
                          {t("serviceHint.blocks.tip")}
                        </Button>
                      </div>
                    </div>
                  </section>
                ))}
              </div>

              <div className="bg-card/95 sticky bottom-0 -mx-6 flex flex-col gap-3 border-t px-6 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="text-muted-foreground text-xs">
                  {isDirty
                    ? t("serviceHint.editor.unsavedHint")
                    : t("serviceHint.editor.savedHint")}
                </p>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={!isDirty || isEditorDisabled}
                  >
                    <IconRefresh className="size-4" />
                    {t("serviceHint.actions.reset")}
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={
                      isEditorDisabled || !selectedServiceUuid || !isDirty
                    }
                  >
                    {isSaving ? (
                      <IconLoader2 className="size-4 animate-spin" />
                    ) : (
                      <IconDeviceFloppy className="size-4" />
                    )}
                    {t("serviceHint.actions.save")}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
