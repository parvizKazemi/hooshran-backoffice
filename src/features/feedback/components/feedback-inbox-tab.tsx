import React, { useState } from "react";
import {
  IconDeviceDesktop,
  IconDeviceMobile,
  IconExternalLink,
  IconInbox,
  IconNotes,
  IconRefresh,
  IconSearch,
  IconThumbDown,
  IconThumbUp,
  IconTrash,
  IconUser,
  IconVideo,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddFeedbackNote,
  useDeleteFeedbackNote,
  useFeedbackDetail,
  useFeedbacks,
  useUpdateFeedbackStatus,
} from "../hooks/use-feedback";
import type {
  AdminFeedbackQuery,
  FeedbackRating,
  FeedbackStatus,
  FeedbackType,
} from "../types";

const STATUS_LABELS: Record<
  FeedbackStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "در انتظار بررسی",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
  },
  IN_REVIEW: {
    label: "در حال بررسی",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300",
  },
  RESOLVED: {
    label: "حل شده",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  REJECTED: {
    label: "رد شده",
    className:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300",
  },
  ARCHIVED: {
    label: "بایگانی شده",
    className:
      "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
};

export function FeedbackInboxTab() {
  const [filters, setFilters] = useState<AdminFeedbackQuery>({
    page: 1,
    limit: 15,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState("");

  const { data, isLoading, refetch } = useFeedbacks(filters);
  const { data: feedbackDetail, isLoading: isLoadingDetail } =
    useFeedbackDetail(selectedUuid || "", Boolean(selectedUuid));

  const updateStatusMutation = useUpdateFeedbackStatus();
  const addNoteMutation = useAddFeedbackNote();
  const deleteNoteMutation = useDeleteFeedbackNote();

  const items = data?.items || [];
  const total = data?.total || 0;
  const currentPage = data?.page || 1;
  const limit = data?.limit || 15;
  const totalPages = Math.ceil(total / limit) || 1;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      page: 1,
      search: searchTerm.trim() || undefined,
    }));
  };

  const handleTypeChange = (val: string) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      type: val === "ALL" ? undefined : (val as FeedbackType),
    }));
  };

  const handleStatusChange = (val: string) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      status: val === "ALL" ? undefined : (val as FeedbackStatus),
    }));
  };

  const handleRatingChange = (val: string) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      rating: val === "ALL" ? undefined : (val as FeedbackRating),
    }));
  };

  const handleAddNote = async () => {
    if (!selectedUuid || !newNoteText.trim()) return;
    await addNoteMutation.mutateAsync({
      uuid: selectedUuid,
      note: newNoteText.trim(),
    });
    setNewNoteText("");
  };

  const handleDeleteNote = async (noteUuid: string) => {
    if (!selectedUuid) return;
    await deleteNoteMutation.mutateAsync({
      uuid: selectedUuid,
      noteUuid,
    });
  };

  const handleStatusUpdate = async (newStatus: FeedbackStatus) => {
    if (!selectedUuid) return;
    await updateStatusMutation.mutateAsync({
      uuid: selectedUuid,
      status: newStatus,
    });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return `${d.toLocaleDateString("fa-IR")} ${d.toLocaleTimeString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Filters Bar */}
      <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <form
            onSubmit={handleSearchSubmit}
            className="flex min-w-[260px] flex-1 items-center gap-2"
          >
            <div className="relative flex-1">
              <IconSearch className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="جستجو در نظرات، آدرس صفحه یا شناسه..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-xl pr-9"
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              className="min-h-[42px] rounded-xl px-4 font-bold"
            >
              جستجو
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-3">
            {/* Type selector */}
            <Select
              value={filters.type || "ALL"}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger className="w-[145px] rounded-xl text-xs font-bold">
                <SelectValue placeholder="نوع بازخورد" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">همه انواع</SelectItem>
                <SelectItem value="BUG_REPORT">گزارش خطا</SelectItem>
                <SelectItem value="INLINE_AI">بازخورد خروجی AI</SelectItem>
              </SelectContent>
            </Select>

            {/* Status selector */}
            <Select
              value={filters.status || "ALL"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-[155px] rounded-xl text-xs font-bold">
                <SelectValue placeholder="وضعیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">همه وضعیت‌ها</SelectItem>
                <SelectItem value="PENDING">در انتظار بررسی</SelectItem>
                <SelectItem value="IN_REVIEW">در حال بررسی</SelectItem>
                <SelectItem value="RESOLVED">حل شده</SelectItem>
                <SelectItem value="REJECTED">رد شده</SelectItem>
                <SelectItem value="ARCHIVED">بایگانی شده</SelectItem>
              </SelectContent>
            </Select>

            {/* Rating selector */}
            <Select
              value={filters.rating || "ALL"}
              onValueChange={handleRatingChange}
            >
              <SelectTrigger className="w-[125px] rounded-xl text-xs font-bold">
                <SelectValue placeholder="امتیاز" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">همه امتیازها</SelectItem>
                <SelectItem value="GOOD">خوب (GOOD)</SelectItem>
                <SelectItem value="NEUTRAL">متوسط (NEUTRAL)</SelectItem>
                <SelectItem value="BAD">بد (BAD)</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              className="size-10 rounded-xl"
              title="تازه‌سازی"
            >
              <IconRefresh className="size-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Feedbacks Table */}
      <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <IconInbox className="size-5 text-blue-600" />
            <span className="font-bold text-slate-800 dark:text-slate-100">
              لیست بازخوردها و گزارش‌های دریافتی
            </span>
          </div>
          <span className="text-xs font-medium text-slate-500">
            مجموع: {total} مورد
          </span>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col gap-3 p-6">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                <IconInbox className="size-7" />
              </div>
              <p className="text-sm font-medium">هیچ موردی یافت نشد</p>
              <p className="text-xs">
                با تغییر فیلترها یا جستجو می‌توانید نتایج دیگری را بیابید
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse text-right text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold tracking-wide text-slate-500 uppercase dark:border-slate-800 dark:text-slate-400">
                    <th className="px-4 py-3">نوع</th>
                    <th className="px-4 py-3">امتیاز / دسته‌بندی</th>
                    <th className="px-4 py-3">کاربر</th>
                    <th className="px-4 py-3">متن بازخورد</th>
                    <th className="px-4 py-3">صفحه</th>
                    <th className="px-4 py-3">دستگاه</th>
                    <th className="px-4 py-3">وضعیت</th>
                    <th className="px-4 py-3">تاریخ</th>
                    <th className="px-4 py-3 text-left">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {items.map((item) => (
                    <tr
                      key={item.uuid}
                      className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-4 align-middle">
                        {item.type === "BUG_REPORT" ? (
                          <Badge
                            variant="outline"
                            className="border-rose-200 bg-rose-50 font-bold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
                          >
                            گزارش خطا
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-blue-200 bg-blue-50 font-bold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300"
                          >
                            خروجی AI
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <div className="flex flex-col gap-1">
                          {item.rating && (
                            <div className="flex items-center gap-1">
                              {item.rating === "GOOD" && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                                  <IconThumbUp className="size-3" /> عالی
                                </span>
                              )}
                              {item.rating === "NEUTRAL" && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-600 dark:bg-amber-950/40 dark:text-amber-300">
                                  متوسط
                                </span>
                              )}
                              {item.rating === "BAD" && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
                                  <IconThumbDown className="size-3" /> نامناسب
                                </span>
                              )}
                            </div>
                          )}
                          {item.categoryTags &&
                            item.categoryTags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {item.categoryTags.slice(0, 2).map((tag, i) => (
                                  <span
                                    key={i}
                                    className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {item.categoryTags.length > 2 && (
                                  <span className="text-[10px] text-slate-400">
                                    +{item.categoryTags.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle">
                        {item.user ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {item.user.firstName || item.user.lastName
                                ? `${item.user.firstName || ""} ${item.user.lastName || ""}`.trim()
                                : item.user.phoneNumber ||
                                  `کاربر #${item.user.id}`}
                            </span>
                            {item.user.activeSubscription?.packageName && (
                              <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">
                                {item.user.activeSubscription.packageName}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
                            کاربر مهمان
                          </span>
                        )}
                      </td>
                      <td className="max-w-xs px-4 py-4 align-middle">
                        <p
                          className="truncate text-xs text-slate-700 dark:text-slate-300"
                          title={item.comment || ""}
                        >
                          {item.comment || (
                            <span className="text-slate-400 italic">
                              بدون متن نظر
                            </span>
                          )}
                        </p>
                      </td>
                      <td className="max-w-[150px] px-4 py-4 align-middle">
                        <p
                          className="truncate font-mono text-xs text-slate-600 dark:text-slate-400"
                          dir="ltr"
                          title={item.currentUrl}
                        >
                          {item.currentUrl}
                        </p>
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                          {item.deviceType === "mobile" ? (
                            <IconDeviceMobile className="size-3.5 text-orange-500" />
                          ) : (
                            <IconDeviceDesktop className="size-3.5 text-blue-500" />
                          )}
                          <span>{item.os || item.deviceType}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <Badge
                          variant="outline"
                          className={`text-[11px] font-bold ${
                            STATUS_LABELS[item.status]?.className || ""
                          }`}
                        >
                          {STATUS_LABELS[item.status]?.label || item.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 align-middle text-xs whitespace-nowrap text-slate-500">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-left align-middle whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {item.clarityId && (
                            <span
                              title="جلسه ضبط‌شده مایکروسافت کلاریتی موجود است"
                              className="flex size-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-300"
                            >
                              <IconVideo className="size-3.5" />
                            </span>
                          )}
                          {(item.adminNotesCount || 0) > 0 && (
                            <span
                              title={`${item.adminNotesCount} یادداشت تیم`}
                              className="flex items-center gap-0.5 rounded-lg bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-300"
                            >
                              <IconNotes className="size-3" />
                              {item.adminNotesCount}
                            </span>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUuid(item.uuid)}
                            className="min-h-[32px] rounded-lg text-xs font-bold"
                          >
                            جزئیات
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 p-4 dark:border-slate-800">
              <span className="text-xs text-slate-500">
                صفحه {currentPage} از {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: Math.max(1, (prev.page || 1) - 1),
                    }))
                  }
                  className="rounded-lg text-xs font-bold"
                >
                  قبلی
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: (prev.page || 1) + 1,
                    }))
                  }
                  className="rounded-lg text-xs font-bold"
                >
                  بعدی
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog
        open={Boolean(selectedUuid)}
        onOpenChange={(open) => {
          if (!open) setSelectedUuid(null);
        }}
      >
        <DialogContent className="max-w-2xl overflow-hidden rounded-2xl p-0 sm:max-w-3xl">
          <DialogHeader className="border-b border-slate-100 bg-white px-6 py-5 text-right dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <IconInbox className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
                    جزئیات بازخورد و گزارش خطا
                  </DialogTitle>
                  <DialogDescription
                    className="font-mono text-xs text-slate-500 dark:text-slate-400"
                    dir="ltr"
                  >
                    {feedbackDetail?.uuid}
                  </DialogDescription>
                </div>
              </div>

              {/* Status Selector */}
              {feedbackDetail && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    وضعیت:
                  </span>
                  <Select
                    value={feedbackDetail.status}
                    onValueChange={(val) =>
                      handleStatusUpdate(val as FeedbackStatus)
                    }
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="w-[145px] rounded-xl text-xs font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">در انتظار بررسی</SelectItem>
                      <SelectItem value="IN_REVIEW">در حال بررسی</SelectItem>
                      <SelectItem value="RESOLVED">حل شده</SelectItem>
                      <SelectItem value="REJECTED">رد شده</SelectItem>
                      <SelectItem value="ARCHIVED">بایگانی شده</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </DialogHeader>

          <div className="flex max-h-[75vh] flex-col gap-6 overflow-y-auto p-6">
            {isLoadingDetail || !feedbackDetail ? (
              <div className="flex flex-col gap-4 py-8">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
              </div>
            ) : (
              <>
                {/* Clarity Session Replay Banner */}
                {feedbackDetail.clarityUrl ? (
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-900/60 dark:bg-purple-950/40">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                        <IconVideo className="size-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-purple-900 dark:text-purple-200">
                          ویدیو و نشست کاربر در Microsoft Clarity
                        </h4>
                        <p
                          className="font-mono text-xs text-purple-700 dark:text-purple-300"
                          dir="ltr"
                        >
                          شناسه: {feedbackDetail.clarityId}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() =>
                        window.open(feedbackDetail.clarityUrl || "", "_blank")
                      }
                      className="min-h-[40px] gap-1.5 rounded-xl bg-purple-600 text-xs font-bold text-white shadow-sm hover:bg-purple-700"
                    >
                      <IconExternalLink className="size-4" />
                      مشاهده ضبط جلسه
                    </Button>
                  </div>
                ) : null}

                {/* Feedback Content Card */}
                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      متن پیام و بازخورد کاربر
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDate(feedbackDetail.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm leading-7 whitespace-pre-wrap text-slate-800 dark:text-slate-100">
                    {feedbackDetail.comment || "هیچ متنی ارسال نشده است."}
                  </p>

                  {feedbackDetail.categoryTags &&
                    feedbackDetail.categoryTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {feedbackDetail.categoryTags.map((tag, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs font-medium"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                </div>

                {/* Two Column: User & Telemetry */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* User info */}
                  <div className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 text-xs dark:border-slate-800">
                    <span className="mb-1 flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <IconUser className="size-4 text-blue-500" />
                      مشخصات کاربر
                    </span>
                    {feedbackDetail.user ? (
                      <>
                        <div className="flex justify-between border-b border-slate-100 py-1 dark:border-slate-800">
                          <span className="text-slate-500">شناسه کاربر:</span>
                          <span className="font-mono">
                            {feedbackDetail.user.id}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 py-1 dark:border-slate-800">
                          <span className="text-slate-500">شماره تماس:</span>
                          <span className="font-mono">
                            {feedbackDetail.user.phoneNumber || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 py-1 dark:border-slate-800">
                          <span className="text-slate-500">ایمیل:</span>
                          <span className="font-mono">
                            {feedbackDetail.user.email || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">بسته فعال:</span>
                          <span className="font-bold text-blue-600">
                            {feedbackDetail.user.activeSubscription
                              ?.packageName || "پلن رایگان"}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="py-2 text-slate-400">
                        کاربر لاگین نکرده بود (مهمان).
                      </p>
                    )}
                  </div>

                  {/* Telemetry */}
                  <div className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 text-xs dark:border-slate-800">
                    <span className="mb-1 flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <IconDeviceDesktop className="size-4 text-orange-500" />
                      مشخصات فنی و دستگاه
                    </span>
                    <div className="flex justify-between border-b border-slate-100 py-1 dark:border-slate-800">
                      <span className="text-slate-500">نوع دستگاه:</span>
                      <span className="font-semibold">
                        {feedbackDetail.deviceType}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 py-1 dark:border-slate-800">
                      <span className="text-slate-500">سیستم‌عامل:</span>
                      <span>{feedbackDetail.os || "-"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 py-1 dark:border-slate-800">
                      <span className="text-slate-500">مرورگر:</span>
                      <span>{feedbackDetail.browser || "-"}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">آدرس صفحه:</span>
                      <span
                        className="max-w-[180px] truncate font-mono"
                        dir="ltr"
                        title={feedbackDetail.currentUrl}
                      >
                        {feedbackDetail.currentUrl}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Team Notes Section */}
                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <IconNotes className="size-4 text-emerald-500" />
                    یادداشت‌های داخلی تیم پشتیبانی و فنی
                  </span>

                  {/* Existing Notes */}
                  <div className="flex flex-col gap-2.5">
                    {feedbackDetail.adminNotes &&
                    feedbackDetail.adminNotes.length > 0 ? (
                      feedbackDetail.adminNotes.map((note) => (
                        <div
                          key={note.uuid}
                          className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/60"
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {note.author?.firstName ||
                                  note.author?.email ||
                                  "همکار تیم"}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {formatDate(note.createdAt)}
                              </span>
                            </div>
                            <p className="leading-6 text-slate-700 dark:text-slate-300">
                              {note.note}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.uuid)}
                            disabled={deleteNoteMutation.isPending}
                            title="حذف یادداشت"
                            className="p-1 text-slate-400 transition-colors hover:text-rose-500"
                          >
                            <IconTrash className="size-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        هنوز یادداشتی برای این گزارش ثبت نشده است.
                      </p>
                    )}
                  </div>

                  {/* Add Note Form */}
                  <div className="mt-2 flex flex-col gap-2">
                    <Textarea
                      rows={2}
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="ثبت یادداشت جدید برای این گزارش..."
                      className="resize-none text-xs"
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        disabled={
                          !newNoteText.trim() || addNoteMutation.isPending
                        }
                        onClick={handleAddNote}
                        className="min-h-[36px] rounded-lg bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
                      >
                        {addNoteMutation.isPending
                          ? "در حال ثبت..."
                          : "ثبت یادداشت"}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
