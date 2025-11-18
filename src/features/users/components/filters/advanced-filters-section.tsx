import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { UsersQueryParams } from "../../types";

type AdvancedFiltersSectionProps = {
  phoneFilter?: string;
  onPhoneFilterChange?: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  isActiveFilter: string;
  onIsActiveFilterChange: (value: string) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  onApplyFilters: (filters: Partial<UsersQueryParams>) => void;
};

export const AdvancedFiltersSection = memo(function AdvancedFiltersSection({
  phoneFilter: _phoneFilter,
  onPhoneFilterChange: _onPhoneFilterChange,
  roleFilter,
  onRoleFilterChange,
  isActiveFilter,
  onIsActiveFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  sortBy,
  onSortByChange,
  onApplyFilters,
}: AdvancedFiltersSectionProps) {
  // Suppress unused variable warnings
  void _phoneFilter;
  void _onPhoneFilterChange;
  const { t } = useTranslation("common");

  return (
    <div className="bg-muted/30 animate-in slide-in-from-top-2 flex flex-col gap-4 rounded-md border p-4 duration-200">
      <div className="flex flex-wrap gap-4">
        {/* <Input
          placeholder={t("users.phonePlaceholder")}
          value={phoneFilter}
          onChange={(event) => {
            onPhoneFilterChange(event.target.value);
            onApplyFilters({
              phoneNumber: event.target.value || undefined,
            });
          }}
          className="min-w-[200px] flex-1"
        /> */}
        <Select
          value={roleFilter || "all"}
          onValueChange={(value) => {
            onRoleFilterChange(value === "all" ? "" : value);
            onApplyFilters({
              role: value === "all" ? undefined : value,
            });
          }}
        >
          <SelectTrigger className="min-w-[200px]">
            <SelectValue placeholder={t("users.role")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("users.allRoles")}</SelectItem>
            <SelectItem value="ADMIN">{t("users.roles.admin")}</SelectItem>
            <SelectItem value="USER">{t("users.roles.user")}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={isActiveFilter || "all"}
          onValueChange={(value) => {
            onIsActiveFilterChange(value === "all" ? "" : value);
            onApplyFilters({
              isActive: value === "all" ? undefined : value === "true",
            });
          }}
        >
          <SelectTrigger className="min-w-[200px]">
            <SelectValue placeholder={t("users.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("users.allStatuses")}</SelectItem>
            <SelectItem value="true">{t("users.statuses.active")}</SelectItem>
            <SelectItem value="false">
              {t("users.statuses.inactive")}
            </SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sortBy || "all"}
          onValueChange={(value) => {
            onSortByChange(value === "all" ? "" : value);
            onApplyFilters({
              sortBy: value === "all" ? undefined : value,
            });
          }}
        >
          <SelectTrigger className="min-w-[200px]">
            <SelectValue placeholder="مرتب‌سازی بر اساس" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">مرتب سازی پیشفرض</SelectItem>
            <SelectItem value="createdAt">تاریخ ایجاد</SelectItem>
            <SelectItem value="updatedAt">تاریخ به‌روزرسانی</SelectItem>
            <SelectItem value="phoneNumber">شماره تلفن</SelectItem>
            <SelectItem value="full_name">نام</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          placeholder="از تاریخ"
          value={dateFrom}
          onChange={(event) => {
            onDateFromChange(event.target.value);
            onApplyFilters({
              dateFrom: event.target.value || undefined,
            });
          }}
          className="w-fit min-w-[200px]"
        />
        <ArrowLeft size={20} className="text-muted-foreground self-center" />
        <Input
          type="date"
          placeholder="تا تاریخ"
          value={dateTo}
          onChange={(event) => {
            onDateToChange(event.target.value);
            onApplyFilters({
              dateTo: event.target.value || undefined,
            });
          }}
          className="w-fit min-w-[200px]"
        />
      </div>
    </div>
  );
});
