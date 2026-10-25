import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListCollapse, Search, X } from "lucide-react";
import type { ShowcaseStatusFilter } from "../types";

interface ShowcaseToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: ShowcaseStatusFilter;
  onStatusFilterChange: (value: ShowcaseStatusFilter) => void;
  defaultRowsLimit: number;
  onDefaultRowsLimitChange: (limit: number) => void;
}

export function ShowcaseToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  defaultRowsLimit,
  onDefaultRowsLimitChange,
}: ShowcaseToolbarProps) {
  return (
    <div className="bg-card border-border sticky top-0 z-10 flex flex-col justify-between gap-4 rounded-2xl border p-4 shadow-sm lg:flex-row lg:items-center">
      {/* Search & Filter */}
      <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:w-auto">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="text-muted-foreground pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="جستجوی نام سرویس..."
            className="bg-muted/40 focus-visible:ring-primary/20 h-10 rounded-xl ps-8 pe-9 text-sm transition-all focus-visible:ring-2"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="text-muted-foreground hover:text-foreground absolute start-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5"
              title="پاک کردن جستجو"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-52">
          <Select
            value={statusFilter}
            onValueChange={(val) =>
              onStatusFilterChange(val as ShowcaseStatusFilter)
            }
          >
            <SelectTrigger className="bg-muted/40 h-10 w-full rounded-xl text-sm">
              <SelectValue placeholder="فیلتر وضعیت" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">همه وضعیت‌ها</SelectItem>
              <SelectItem value="active">فقط نمایش فعال</SelectItem>
              <SelectItem value="inactive">فقط مخفی‌شده‌ها</SelectItem>
              <SelectItem value="pinned">پرچمدار (پین‌شده)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Global Config: Default rows before "Show More" */}
      <div className="flex w-full items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5 text-blue-900 lg:w-auto dark:text-blue-200">
        <ListCollapse className="size-5 shrink-0 text-blue-600 dark:text-blue-400" />
        <div className="flex w-full items-center justify-between gap-4">
          <label
            htmlFor="default-rows-input"
            className="cursor-pointer text-xs font-bold whitespace-nowrap"
          >
            تعداد ردیف پیش‌فرض قبل از «نمایش بیشتر»:
          </label>
          <input
            id="default-rows-input"
            type="number"
            min={1}
            max={10}
            value={defaultRowsLimit}
            onChange={(e) => {
              const val = Math.max(
                1,
                Math.min(10, parseInt(e.target.value, 10) || 1)
              );
              onDefaultRowsLimitChange(val);
            }}
            className="bg-card border-border text-primary focus:border-primary focus:ring-primary h-8 w-16 rounded-lg border text-center text-sm font-bold shadow-sm transition-all outline-none focus:ring-1"
          />
        </div>
      </div>
    </div>
  );
}
