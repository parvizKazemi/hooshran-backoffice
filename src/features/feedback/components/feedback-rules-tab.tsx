import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  IconClock,
  IconDeviceFloppy,
  IconEye,
  IconInbox,
  IconInfoCircle,
  IconMessage2,
  IconPencil,
  IconPlus,
  IconRotateClockwise,
  IconTrash,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  AutoMessageRule,
  FeedbackMatchType,
  FeedbackRulesConfig,
  ReadyMessageRule,
} from "../types";
import { useFeedbackRules, useSaveFeedbackRules } from "../hooks/use-feedback";

export function FeedbackRulesTab() {
  const { data: serverRules, isLoading } = useFeedbackRules();
  const saveMutation = useSaveFeedbackRules();

  // Local state for editing rules
  const [readyRules, setReadyRules] = useState<ReadyMessageRule[]>([]);
  const [autoRules, setAutoRules] = useState<AutoMessageRule[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Ready Rule Modal state
  const [isReadyModalOpen, setIsReadyModalOpen] = useState(false);
  const [editingReadyId, setEditingReadyId] = useState<string | number | null>(
    null
  );
  const [readyMatchType, setReadyMatchType] =
    useState<FeedbackMatchType>("contains");
  const [readyUrl, setReadyUrl] = useState("");
  const [readyMessages, setReadyMessages] = useState<string[]>([""]);
  const [readyIsActive, setReadyIsActive] = useState(true);
  const [readyErrors, setReadyErrors] = useState<{
    url?: string;
    messages?: string;
  }>({});

  // Auto Rule Modal state
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  const [editingAutoId, setEditingAutoId] = useState<string | number | null>(
    null
  );
  const [autoMatchType, setAutoMatchType] =
    useState<FeedbackMatchType>("contains");
  const [autoUrl, setAutoUrl] = useState("");
  const [autoDelay, setAutoDelay] = useState<number>(30);
  const [autoMessage, setAutoMessage] = useState("");
  const [autoIsActive, setAutoIsActive] = useState(true);
  const [autoErrors, setAutoErrors] = useState<{
    url?: string;
    message?: string;
    delay?: string;
  }>({});

  // Delete Confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "ready" | "auto";
    id: string | number;
  } | null>(null);

  // Sync with server data on load or reset
  useEffect(() => {
    if (serverRules) {
      setReadyRules(serverRules.readyRules || []);
      setAutoRules(serverRules.autoRules || []);
      setHasUnsavedChanges(false);
    }
  }, [serverRules]);

  // Normalize URL (strip leading/trailing whitespace, keep format clean)
  const normalizeUrl = (raw: string) => {
    let clean = raw.trim();
    if (clean.startsWith("/")) {
      clean = clean.replace(/^\/+/, "");
    }
    return clean;
  };

  // --- Ready Modal Handlers ---
  const handleOpenReadyModal = (rule?: ReadyMessageRule) => {
    setReadyErrors({});
    if (rule) {
      setEditingReadyId(rule.id);
      setReadyMatchType(rule.matchType);
      setReadyUrl(rule.url);
      setReadyMessages(rule.messages.length > 0 ? [...rule.messages] : [""]);
      setReadyIsActive(rule.isActive);
    } else {
      setEditingReadyId(null);
      setReadyMatchType("contains");
      setReadyUrl("");
      setReadyMessages([""]);
      setReadyIsActive(true);
    }
    setIsReadyModalOpen(true);
  };

  const handleAddReadyMessageField = () => {
    setReadyMessages((prev) => [...prev, ""]);
  };

  const handleRemoveReadyMessageField = (index: number) => {
    if (readyMessages.length <= 1) {
      toast.warning("حداقل یک پیام باید وجود داشته باشد");
      return;
    }
    setReadyMessages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReadyMessageChange = (index: number, val: string) => {
    setReadyMessages((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
    if (readyErrors.messages) {
      setReadyErrors((prev) => ({ ...prev, messages: undefined }));
    }
  };

  const handleSaveReadyRule = () => {
    const trimmedUrl = normalizeUrl(readyUrl);
    const validMessages = readyMessages
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    const errors: { url?: string; messages?: string } = {};
    if (!trimmedUrl) {
      errors.url = "لطفاً آدرس صفحه را وارد کنید";
    }
    if (validMessages.length === 0) {
      errors.messages = "حداقل یک متن پیام باید وارد شود";
    }

    if (Object.keys(errors).length > 0) {
      setReadyErrors(errors);
      toast.error("لطفاً فیلدهای الزامی را تکمیل کنید");
      return;
    }

    if (editingReadyId !== null) {
      setReadyRules((prev) =>
        prev.map((r) =>
          r.id === editingReadyId
            ? {
                ...r,
                matchType: readyMatchType,
                url: trimmedUrl,
                messages: validMessages,
                isActive: readyIsActive,
                updatedAt: new Date().toISOString(),
              }
            : r
        )
      );
      toast.success("قانون پیام آماده ویرایش شد");
    } else {
      const newRule: ReadyMessageRule = {
        id: `ready_${Date.now()}`,
        matchType: readyMatchType,
        url: trimmedUrl,
        messages: validMessages,
        isActive: readyIsActive,
        createdAt: new Date().toISOString(),
      };
      setReadyRules((prev) => [...prev, newRule]);
      toast.success("قانون پیام آماده جدید افزوده شد");
    }

    setHasUnsavedChanges(true);
    setIsReadyModalOpen(false);
  };

  // --- Auto Modal Handlers ---
  const handleOpenAutoModal = (rule?: AutoMessageRule) => {
    setAutoErrors({});
    if (rule) {
      setEditingAutoId(rule.id);
      setAutoMatchType(rule.matchType);
      setAutoUrl(rule.url);
      setAutoDelay(rule.delay);
      setAutoMessage(rule.message);
      setAutoIsActive(rule.isActive);
    } else {
      setEditingAutoId(null);
      setAutoMatchType("contains");
      setAutoUrl("");
      setAutoDelay(30);
      setAutoMessage("");
      setAutoIsActive(true);
    }
    setIsAutoModalOpen(true);
  };

  const handleSaveAutoRule = () => {
    const trimmedUrl = normalizeUrl(autoUrl);
    const trimmedMessage = autoMessage.trim();
    const delayVal = Number(autoDelay);

    const errors: { url?: string; message?: string; delay?: string } = {};
    if (!trimmedUrl) {
      errors.url = "لطفاً آدرس صفحه را وارد کنید";
    }
    if (!trimmedMessage) {
      errors.message = "لطفاً متن پیام را وارد کنید";
    }
    if (!delayVal || delayVal < 5) {
      errors.delay = "تأخیر باید حداقل ۵ ثانیه باشد";
    }

    if (Object.keys(errors).length > 0) {
      setAutoErrors(errors);
      toast.error("لطفاً فیلدهای الزامی را به درستی تکمیل کنید");
      return;
    }

    if (editingAutoId !== null) {
      setAutoRules((prev) =>
        prev.map((r) =>
          r.id === editingAutoId
            ? {
                ...r,
                matchType: autoMatchType,
                url: trimmedUrl,
                delay: delayVal,
                message: trimmedMessage,
                isActive: autoIsActive,
                updatedAt: new Date().toISOString(),
              }
            : r
        )
      );
      toast.success("قانون پیام خودکار ویرایش شد");
    } else {
      const newRule: AutoMessageRule = {
        id: `auto_${Date.now()}`,
        matchType: autoMatchType,
        url: trimmedUrl,
        delay: delayVal,
        message: trimmedMessage,
        isActive: autoIsActive,
        createdAt: new Date().toISOString(),
      };
      setAutoRules((prev) => [...prev, newRule]);
      toast.success("قانون پیام خودکار جدید افزوده شد");
    }

    setHasUnsavedChanges(true);
    setIsAutoModalOpen(false);
  };

  // Quick toggle active
  const handleToggleReadyActive = (id: string | number, current: boolean) => {
    setReadyRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !current } : r))
    );
    setHasUnsavedChanges(true);
  };

  const handleToggleAutoActive = (id: string | number, current: boolean) => {
    setAutoRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !current } : r))
    );
    setHasUnsavedChanges(true);
  };

  // Confirm and delete
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "ready") {
      setReadyRules((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      toast.success("قانون پیام آماده حذف شد");
    } else {
      setAutoRules((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      toast.success("قانون پیام خودکار حذف شد");
    }
    setHasUnsavedChanges(true);
    setDeleteTarget(null);
  };

  // Save all settings to API / Storage
  const handleSaveAll = async () => {
    const payload: FeedbackRulesConfig = {
      readyRules,
      autoRules,
    };
    await saveMutation.mutateAsync(payload);
    setHasUnsavedChanges(false);
  };

  // Reset / Cancel
  const handleCancelChanges = () => {
    if (serverRules) {
      setReadyRules(serverRules.readyRules || []);
      setAutoRules(serverRules.autoRules || []);
    }
    setHasUnsavedChanges(false);
    toast.info("تغییرات لغو و به آخرین نسخه ذخیره‌شده بازگردانده شد");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 py-4">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* ============================================================ */}
      {/* بخش ۱: پیام آماده                                            */}
      {/* ============================================================ */}
      <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:border dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <IconMessage2 className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                پیام آماده
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                وقتی کاربر دکمه «دریافت بازخورد» را می‌زند این پیام‌ها نمایش
                داده می‌شوند
              </p>
            </div>
          </div>
          <Button
            onClick={() => handleOpenReadyModal()}
            className="flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 dark:border dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            <IconPlus className="size-4" />
            تعریف پیام
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          {readyRules.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-400">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                <IconInbox className="size-7" />
              </div>
              <p className="text-sm font-medium">هنوز پیامی تعریف نشده</p>
              <p className="text-xs">
                روی «تعریف پیام» کلیک کنید تا اولین قانون را بسازید
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-right text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold tracking-wide text-slate-500 uppercase dark:border-slate-800 dark:text-slate-400">
                    <th className="px-3 pb-3">نوع تطابق</th>
                    <th className="px-3 pb-3">آدرس صفحه</th>
                    <th className="px-3 pb-3">تعداد و متن پیام‌ها</th>
                    <th className="px-3 pb-3">وضعیت</th>
                    <th className="px-3 pb-3 text-left">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {readyRules.map((r) => (
                    <tr
                      key={r.id}
                      className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-3 py-4 align-middle">
                        <Badge
                          variant="outline"
                          className={
                            r.matchType === "contains"
                              ? "border-blue-200 bg-blue-50 text-xs font-bold text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                              : "border-purple-200 bg-purple-50 text-xs font-bold text-purple-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }
                        >
                          {r.matchType === "contains" ? "شامل" : "دقیقاً"}
                        </Badge>
                      </td>
                      <td className="px-3 py-4 align-middle">
                        <code
                          className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          dir="ltr"
                        >
                          /{r.url}
                        </code>
                      </td>
                      <td className="max-w-xs px-3 py-4 align-middle">
                        <div className="flex flex-wrap gap-1.5">
                          {r.messages.map((msg, idx) => (
                            <span
                              key={idx}
                              title={msg}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100/80 px-2.5 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            >
                              <IconMessage2 className="size-3 text-blue-500 dark:text-slate-400" />
                              <span className="max-w-[140px] truncate">
                                {msg}
                              </span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-4 align-middle">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={r.isActive}
                            onCheckedChange={() =>
                              handleToggleReadyActive(r.id, r.isActive)
                            }
                            aria-label="تغییر وضعیت"
                          />
                          <span
                            className={`text-xs font-bold ${
                              r.isActive
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-slate-400"
                            }`}
                          >
                            {r.isActive ? "فعال" : "غیرفعال"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-left align-middle">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenReadyModal(r)}
                            title="ویرایش قانون"
                            className="flex size-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                          >
                            <IconPencil className="size-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteTarget({ type: "ready", id: r.id })
                            }
                            title="حذف قانون"
                            className="flex size-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400"
                          >
                            <IconTrash className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============================================================ */}
      {/* بخش ۲: پیام خودکار زمان‌بندی‌شده                            */}
      {/* ============================================================ */}
      <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
              <IconClock className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                پیام خودکار
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                بعد از مدت تعیین‌شده حضور کاربر در صفحه، پاپ‌آپ خودکار نمایش
                داده می‌شود (این پیام در هر نشست کاربر فقط یکبار نشان داده
                می‌شود)
              </p>
            </div>
          </div>
          <Button
            onClick={() => handleOpenAutoModal()}
            className="flex min-h-[44px] items-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-orange-600 dark:border dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            <IconPlus className="size-4" />
            تعریف پیام
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          {autoRules.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-400">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                <IconInbox className="size-7" />
              </div>
              <p className="text-sm font-medium">هنوز پیامی تعریف نشده</p>
              <p className="text-xs">
                روی «تعریف پیام» کلیک کنید تا اولین قانون را بسازید
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-right text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold tracking-wide text-slate-500 uppercase dark:border-slate-800 dark:text-slate-400">
                    <th className="px-3 pb-3">نوع تطابق</th>
                    <th className="px-3 pb-3">آدرس صفحه</th>
                    <th className="px-3 pb-3">تأخیر</th>
                    <th className="px-3 pb-3">متن پیام</th>
                    <th className="px-3 pb-3">وضعیت</th>
                    <th className="px-3 pb-3 text-left">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {autoRules.map((r) => (
                    <tr
                      key={r.id}
                      className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-3 py-4 align-middle">
                        <Badge
                          variant="outline"
                          className={
                            r.matchType === "contains"
                              ? "border-blue-200 bg-blue-50 text-xs font-bold text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                              : "border-purple-200 bg-purple-50 text-xs font-bold text-purple-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }
                        >
                          {r.matchType === "contains" ? "شامل" : "دقیقاً"}
                        </Badge>
                      </td>
                      <td className="px-3 py-4 align-middle">
                        <code
                          className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          dir="ltr"
                        >
                          /{r.url}
                        </code>
                      </td>
                      <td className="px-3 py-4 align-middle">
                        <span className="inline-flex items-center gap-1 rounded-md border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300">
                          <IconClock className="size-3" />
                          {r.delay} ثانیه
                        </span>
                      </td>
                      <td className="max-w-xs px-3 py-4 align-middle">
                        <p
                          className="truncate text-xs text-slate-700 dark:text-slate-300"
                          title={r.message}
                        >
                          {r.message}
                        </p>
                      </td>
                      <td className="px-3 py-4 align-middle">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={r.isActive}
                            onCheckedChange={() =>
                              handleToggleAutoActive(r.id, r.isActive)
                            }
                            aria-label="تغییر وضعیت"
                          />
                          <span
                            className={`text-xs font-bold ${
                              r.isActive
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-slate-400"
                            }`}
                          >
                            {r.isActive ? "فعال" : "غیرفعال"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-left align-middle">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenAutoModal(r)}
                            title="ویرایش قانون"
                            className="flex size-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                          >
                            <IconPencil className="size-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteTarget({ type: "auto", id: r.id })
                            }
                            title="حذف قانون"
                            className="flex size-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400"
                          >
                            <IconTrash className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============================================================ */}
      {/* Bottom Save Bar                                              */}
      {/* ============================================================ */}
      <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <IconInfoCircle className="size-4 text-slate-500 dark:text-slate-400" />
          تغییرات پس از کلیک «ذخیره تنظیمات» در پلتفرم برای کاربران اعمال می‌شود
          {hasUnsavedChanges && (
            <Badge
              variant="outline"
              className="border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
            >
              تغییرات ذخیره نشده دارید
            </Badge>
          )}
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleCancelChanges}
            disabled={!hasUnsavedChanges && !saveMutation.isPending}
            className="min-h-[44px] rounded-xl px-5 text-sm font-bold text-slate-700 dark:text-slate-300"
          >
            <IconRotateClockwise className="ml-1.5 size-4" />
            انصراف
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={saveMutation.isPending}
            className="flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-600 px-7 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 dark:border dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:shadow-none dark:hover:bg-slate-700"
          >
            <IconDeviceFloppy className="size-4" />
            {saveMutation.isPending ? "در حال ذخیره..." : "ذخیره تنظیمات"}
          </Button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL: تعریف / ویرایش پیام آماده                             */}
      {/* ============================================================ */}
      <Dialog open={isReadyModalOpen} onOpenChange={setIsReadyModalOpen}>
        <DialogContent className="max-w-lg overflow-hidden rounded-2xl p-0 sm:max-w-xl">
          <DialogHeader className="border-b border-slate-100 bg-white px-6 py-5 text-right dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:border dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <IconMessage2 className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {editingReadyId ? "ویرایش پیام آماده" : "تعریف پیام آماده"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  یک قانون برای یک آدرس صفحه
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto px-6 py-5">
            {/* Match Type */}
            <div>
              <label className="mb-2 block text-xs font-bold tracking-wide text-slate-600 uppercase dark:text-slate-300">
                نوع تطابق آدرس <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setReadyMatchType("contains")}
                  className={`min-h-[44px] rounded-xl border text-xs font-bold transition-all ${
                    readyMatchType === "contains"
                      ? "border-blue-400 bg-blue-50 text-blue-700 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                  }`}
                >
                  شامل (contains)
                </button>
                <button
                  type="button"
                  onClick={() => setReadyMatchType("exact")}
                  className={`min-h-[44px] rounded-xl border text-xs font-bold transition-all ${
                    readyMatchType === "exact"
                      ? "border-purple-400 bg-purple-50 text-purple-700 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                  }`}
                >
                  دقیقاً (exact)
                </button>
              </div>
            </div>

            {/* URL input */}
            <div>
              <label className="mb-2 block text-xs font-bold tracking-wide text-slate-600 uppercase dark:text-slate-300">
                آدرس صفحه <span className="text-rose-500">*</span>
              </label>
              <div
                className={`flex items-center overflow-hidden rounded-xl border bg-slate-50 dark:bg-slate-800/60 ${
                  readyErrors.url
                    ? "border-rose-400 ring-2 ring-rose-400/20"
                    : "border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-slate-700 dark:focus-within:border-slate-500 dark:focus-within:ring-slate-500/20"
                }`}
              >
                <span className="px-3 text-sm text-slate-400 select-none">
                  /
                </span>
                <input
                  type="text"
                  value={readyUrl}
                  onChange={(e) => {
                    setReadyUrl(e.target.value);
                    if (readyErrors.url) {
                      setReadyErrors((prev) => ({ ...prev, url: undefined }));
                    }
                  }}
                  placeholder="مثال: subscription یا dashboard/reports"
                  className="w-full bg-transparent py-2.5 pl-3 text-sm text-slate-800 outline-none dark:text-slate-100"
                  dir="ltr"
                />
              </div>
              {readyErrors.url && (
                <p className="mt-1 text-xs font-medium text-rose-500">
                  {readyErrors.url}
                </p>
              )}
              <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                «شامل» یعنی آدرس صفحه شامل این متن باشد. «دقیقاً» یعنی URL کامل
                یکسان باشد.
              </p>
            </div>

            {/* Messages dynamic list */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-bold tracking-wide text-slate-600 uppercase dark:text-slate-300">
                  پیام‌ها <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddReadyMessageField}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 transition-colors hover:text-blue-700 dark:text-slate-300 dark:hover:text-white"
                >
                  <IconPlus className="size-3.5" />
                  افزودن پیام
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {readyMessages.map((msg, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Textarea
                      rows={2}
                      value={msg}
                      onChange={(e) =>
                        handleReadyMessageChange(idx, e.target.value)
                      }
                      placeholder={`متن پیام ${idx + 1}...`}
                      className={`min-h-[64px] resize-none text-sm leading-6 ${
                        readyErrors.messages
                          ? "border-rose-400 ring-2 ring-rose-400/20"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveReadyMessageField(idx)}
                      disabled={readyMessages.length <= 1}
                      title="حذف این پیام"
                      className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <IconTrash className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
              {readyErrors.messages && (
                <p className="mt-1.5 text-xs font-medium text-rose-500">
                  {readyErrors.messages}
                </p>
              )}
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                می‌توانید چند پیام تعریف کنید — یکی از آن‌ها به تصادف یا
                به‌ترتیب به کاربر نمایش داده می‌شود.
              </p>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                فعال باشد
              </span>
              <Switch
                checked={readyIsActive}
                onCheckedChange={setReadyIsActive}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-row justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsReadyModalOpen(false)}
              className="min-h-[44px] rounded-xl px-5 text-sm font-bold"
            >
              انصراف
            </Button>
            <Button
              type="button"
              onClick={handleSaveReadyRule}
              className="flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-sm hover:bg-blue-700 dark:border dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              <IconDeviceFloppy className="size-4" />
              ذخیره
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* MODAL: تعریف / ویرایش پیام خودکار                           */}
      {/* ============================================================ */}
      <Dialog open={isAutoModalOpen} onOpenChange={setIsAutoModalOpen}>
        <DialogContent className="max-w-lg overflow-hidden rounded-2xl p-0 sm:max-w-xl">
          <DialogHeader className="border-b border-slate-100 bg-white px-6 py-5 text-right dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                <IconClock className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {editingAutoId ? "ویرایش پیام خودکار" : "تعریف پیام خودکار"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  پاپ‌آپ زمان‌دار برای یک آدرس صفحه — این پیام در هر نشست کاربر
                  فقط یکبار نشان داده می‌شود
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto px-6 py-5">
            {/* Session notice */}
            <div className="flex items-center gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3 text-xs font-medium text-amber-800 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
              <IconInfoCircle className="size-4 shrink-0 text-amber-600 dark:text-slate-400" />
              <span>این پیام در هر نشست کاربر فقط یکبار نشان داده می‌شود.</span>
            </div>

            {/* Match Type */}
            <div>
              <label className="mb-2 block text-xs font-bold tracking-wide text-slate-600 uppercase dark:text-slate-300">
                نوع تطابق آدرس <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAutoMatchType("contains")}
                  className={`min-h-[44px] rounded-xl border text-xs font-bold transition-all ${
                    autoMatchType === "contains"
                      ? "border-orange-400 bg-orange-50 text-orange-700 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                  }`}
                >
                  شامل (contains)
                </button>
                <button
                  type="button"
                  onClick={() => setAutoMatchType("exact")}
                  className={`min-h-[44px] rounded-xl border text-xs font-bold transition-all ${
                    autoMatchType === "exact"
                      ? "border-purple-400 bg-purple-50 text-purple-700 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                  }`}
                >
                  دقیقاً (exact)
                </button>
              </div>
            </div>

            {/* URL input */}
            <div>
              <label className="mb-2 block text-xs font-bold tracking-wide text-slate-600 uppercase dark:text-slate-300">
                آدرس صفحه <span className="text-rose-500">*</span>
              </label>
              <div
                className={`flex items-center overflow-hidden rounded-xl border bg-slate-50 dark:bg-slate-800/60 ${
                  autoErrors.url
                    ? "border-rose-400 ring-2 ring-rose-400/20"
                    : "border-slate-200 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-500/20 dark:border-slate-700 dark:focus-within:border-slate-500 dark:focus-within:ring-slate-500/20"
                }`}
              >
                <span className="px-3 text-sm text-slate-400 select-none">
                  /
                </span>
                <input
                  type="text"
                  value={autoUrl}
                  onChange={(e) => {
                    setAutoUrl(e.target.value);
                    if (autoErrors.url) {
                      setAutoErrors((prev) => ({ ...prev, url: undefined }));
                    }
                  }}
                  placeholder="مثال: tools یا dashboard/reports"
                  className="w-full bg-transparent py-2.5 pl-3 text-sm text-slate-800 outline-none dark:text-slate-100"
                  dir="ltr"
                />
              </div>
              {autoErrors.url && (
                <p className="mt-1 text-xs font-medium text-rose-500">
                  {autoErrors.url}
                </p>
              )}
            </div>

            {/* Delay with Stepper */}
            <div>
              <label className="mb-2 block text-xs font-bold tracking-wide text-slate-600 uppercase dark:text-slate-300">
                تأخیر نمایش <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50/70 p-3.5 dark:border-orange-950 dark:bg-orange-950/30">
                <IconClock className="size-5 shrink-0 text-orange-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  بعد از حضور کاربر به مدت
                </span>
                <div className="mr-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setAutoDelay((prev) => Math.max(5, (prev || 30) - 5))
                    }
                    className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-base font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    −
                  </button>
                  <Input
                    type="number"
                    min={5}
                    max={3600}
                    value={autoDelay}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setAutoDelay(isNaN(val) ? 5 : val);
                      if (autoErrors.delay) {
                        setAutoErrors((prev) => ({
                          ...prev,
                          delay: undefined,
                        }));
                      }
                    }}
                    className="w-20 text-center font-bold"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setAutoDelay((prev) => Math.min(3600, (prev || 30) + 5))
                    }
                    className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-base font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    +
                  </button>
                  <span className="text-xs font-medium text-slate-500">
                    ثانیه
                  </span>
                </div>
              </div>
              {autoErrors.delay && (
                <p className="mt-1 text-xs font-medium text-rose-500">
                  {autoErrors.delay}
                </p>
              )}
            </div>

            {/* Message input */}
            <div>
              <label className="mb-2 block text-xs font-bold tracking-wide text-slate-600 uppercase dark:text-slate-300">
                متن پیام پاپ‌آپ <span className="text-rose-500">*</span>
              </label>
              <Textarea
                rows={3}
                value={autoMessage}
                onChange={(e) => {
                  setAutoMessage(e.target.value);
                  if (autoErrors.message) {
                    setAutoErrors((prev) => ({ ...prev, message: undefined }));
                  }
                }}
                placeholder="متن پاپ‌آپی که بعد از مدت مشخص به کاربر نشان داده می‌شود..."
                className={`min-h-[80px] resize-none leading-7 ${
                  autoErrors.message
                    ? "border-rose-400 ring-2 ring-rose-400/20"
                    : ""
                }`}
              />
              {autoErrors.message && (
                <p className="mt-1 text-xs font-medium text-rose-500">
                  {autoErrors.message}
                </p>
              )}
            </div>

            {/* Live Preview Box */}
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <p className="mb-2.5 flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                <IconEye className="size-4" />
                پیش‌نمایش لحظه‌ای پاپ‌آپ
              </p>
              <div className="max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                    <IconClock className="size-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    پیام از هوشران
                  </span>
                </div>
                <p className="text-xs leading-6 text-slate-600 dark:text-slate-300">
                  {autoMessage.trim() ||
                    "متن پاپ‌آپ زمان‌دار اینجا به صورت زنده نمایش داده می‌شود..."}
                </p>
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                فعال باشد
              </span>
              <Switch
                checked={autoIsActive}
                onCheckedChange={setAutoIsActive}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-row justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAutoModalOpen(false)}
              className="min-h-[44px] rounded-xl px-5 text-sm font-bold"
            >
              انصراف
            </Button>
            <Button
              type="button"
              onClick={handleSaveAutoRule}
              className="flex min-h-[44px] items-center gap-2 rounded-xl bg-orange-500 px-6 text-sm font-bold text-white shadow-sm hover:bg-orange-600 dark:border dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              <IconDeviceFloppy className="size-4" />
              ذخیره
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* MODAL: تایید حذف قانون                                       */}
      {/* ============================================================ */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="max-w-sm rounded-2xl p-6 text-center">
          <AlertDialogHeader className="flex flex-col items-center gap-3 text-center sm:text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-500 dark:bg-rose-950 dark:text-rose-400">
              <IconTrash className="size-7" />
            </div>
            <AlertDialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
              حذف قانون
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500 dark:text-slate-400">
              آیا از حذف این قانون اطمینان دارید؟ این عملیات قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex flex-row justify-center gap-3 sm:justify-center">
            <AlertDialogCancel className="min-h-[42px] rounded-xl px-5 text-sm font-bold">
              انصراف
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="min-h-[42px] rounded-xl bg-rose-600 px-6 text-sm font-bold text-white hover:bg-rose-700"
            >
              بله، حذف کن
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
