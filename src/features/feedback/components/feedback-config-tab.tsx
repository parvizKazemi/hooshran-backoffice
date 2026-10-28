import React, { useEffect, useState } from "react";
import {
  IconActivity,
  IconBug,
  IconCheck,
  IconDeviceFloppy,
  IconSettings,
  IconThumbUp,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useFeedbackAnalytics,
  useFeedbackConfig,
  useUpdateFeedbackConfig,
} from "../hooks/use-feedback";

export function FeedbackConfigTab() {
  const { data: config, isLoading: isLoadingConfig } = useFeedbackConfig();
  const { data: analytics, isLoading: isLoadingAnalytics } =
    useFeedbackAnalytics();
  const updateConfigMutation = useUpdateFeedbackConfig();

  const [maxPrompts, setMaxPrompts] = useState<number>(5);
  const [cooldownDays, setCooldownDays] = useState<number>(30);

  useEffect(() => {
    if (config) {
      setMaxPrompts(config.maxFeedbackPromptsPerUser ?? 5);
      setCooldownDays(config.feedbackCooldownDays ?? 30);
    }
  }, [config]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateConfigMutation.mutateAsync({
      maxFeedbackPromptsPerUser: Number(maxPrompts),
      feedbackCooldownDays: Number(cooldownDays),
    });
  };

  const total = analytics?.total || 0;
  const inlineAi = analytics?.inlineAi || 0;
  const bugReports = analytics?.bugReports || 0;
  const ratingBreakdown = analytics?.ratingBreakdown || {};
  const statusBreakdown = analytics?.statusBreakdown || {};

  const goodCount = Number(ratingBreakdown.GOOD || 0);
  const neutralCount = Number(ratingBreakdown.NEUTRAL || 0);
  const badCount = Number(ratingBreakdown.BAD || 0);
  const totalRated = goodCount + neutralCount + badCount;

  const goodPct = totalRated ? Math.round((goodCount / totalRated) * 100) : 0;

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Analytics Cards */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-800 dark:text-slate-100">
          <IconActivity className="size-5 text-blue-600" />
          خلاصه آماری و توزیع بازخوردها
        </h3>

        {isLoadingAnalytics ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total */}
            <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-bold text-slate-500">
                کل بازخوردها و گزارش‌ها
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
                  {total}
                </span>
                <span className="text-xs text-slate-400">مورد ثبت شده</span>
              </div>
            </Card>

            {/* Bugs */}
            <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  گزارش‌های خطا
                </span>
                <div className="flex size-7 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                  <IconBug className="size-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                  {bugReports}
                </span>
                <span className="text-xs text-slate-400">
                  {total ? Math.round((bugReports / total) * 100) : 0}% کل
                </span>
              </div>
            </Card>

            {/* Inline AI Satisfaction */}
            <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  رضایت از خروجی‌های AI
                </span>
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <IconThumbUp className="size-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {goodPct}%
                </span>
                <span className="text-xs text-slate-400">
                  ({goodCount} از {inlineAi || totalRated} کل خروجی‌ها)
                </span>
              </div>
            </Card>

            {/* Resolution throughput */}
            <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  گزارش‌های حل شده
                </span>
                <div className="flex size-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <IconCheck className="size-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                  {statusBreakdown.RESOLVED || 0}
                </span>
                <span className="text-xs text-slate-400">
                  در انتظار: {statusBreakdown.PENDING || 0}
                </span>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Threshold Configuration Form */}
      <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="border-b border-slate-100 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <IconSettings className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
                تنظیمات آستانه نمایش و جلوگیری از خستگی کاربر
              </CardTitle>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                تنظیم تعداد مجاز درخواست بازخورد اینلاین به هر کاربر و دوره
                استراحت (Cooldown)
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {isLoadingConfig ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ) : (
            <form
              onSubmit={handleSaveConfig}
              className="flex max-w-xl flex-col gap-6"
            >
              <div>
                <label className="mb-2 block text-xs font-bold tracking-wide text-slate-700 uppercase dark:text-slate-300">
                  سقف تعداد درخواست بازخورد به هر کاربر (در دوره)
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={maxPrompts}
                    onChange={(e) =>
                      setMaxPrompts(
                        Math.max(1, parseInt(e.target.value, 10) || 1)
                      )
                    }
                    className="max-w-[140px] rounded-xl font-bold"
                  />
                  <span className="text-xs text-slate-500">
                    بار (پیش‌فرض: ۵ بار)
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                  پس از رسیدن کاربر به این سقف، درخواست بازخورد اینلاین تا پایان
                  دوره استراحت پنهان خواهد شد.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold tracking-wide text-slate-700 uppercase dark:text-slate-300">
                  مدت زمان دوره استراحت (Cooldown Days)
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={cooldownDays}
                    onChange={(e) =>
                      setCooldownDays(
                        Math.max(1, parseInt(e.target.value, 10) || 1)
                      )
                    }
                    className="max-w-[140px] rounded-xl font-bold"
                  />
                  <span className="text-xs text-slate-500">
                    روز (پیش‌فرض: ۳۰ روز)
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                  تعداد روزهایی که پس از تکمیل سقف بازخورد، مجدداً به کاربر
                  درخواست نشان داده نخواهد شد.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={updateConfigMutation.isPending}
                  className="flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-600 px-7 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  <IconDeviceFloppy className="size-4" />
                  {updateConfigMutation.isPending
                    ? "در حال ذخیره..."
                    : "ذخیره تنظیمات آستانه"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
