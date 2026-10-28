import { IconMessageHeart } from "@tabler/icons-react";
import { FeedbackRulesTab } from "./components/feedback-rules-tab";

export default function FeedbackManagement() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-2 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:border dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <IconMessageHeart className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              مدیریت بازخورد کاربران
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              تعریف پیام‌های آماده و پیام‌های خودکار برای هر آدرس صفحه
            </p>
          </div>
        </div>
      </div>

      {/* Main Feedback Rules View (Matching HTML Prototype) */}
      <FeedbackRulesTab />
    </div>
  );
}
