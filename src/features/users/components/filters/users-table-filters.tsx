import { memo } from "react";
import { UsersQueryParams } from "../../types";
import { AdvancedFiltersSection } from "./advanced-filters-section";
import { UsersSearchBar } from "./users-search-bar";

type UsersTableFiltersProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
  phoneFilter: string;
  onPhoneFilterChange: (value: string) => void;
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

export const UsersTableFilters = memo(function UsersTableFilters({
  searchQuery,
  onSearchChange,
  showAdvancedFilters,
  onToggleAdvancedFilters,
  phoneFilter,
  onPhoneFilterChange,
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
}: UsersTableFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <UsersSearchBar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        showAdvancedFilters={showAdvancedFilters}
        onToggleAdvancedFilters={onToggleAdvancedFilters}
      />
      {showAdvancedFilters && (
        <AdvancedFiltersSection
          phoneFilter={phoneFilter}
          onPhoneFilterChange={onPhoneFilterChange}
          roleFilter={roleFilter}
          onRoleFilterChange={onRoleFilterChange}
          isActiveFilter={isActiveFilter}
          onIsActiveFilterChange={onIsActiveFilterChange}
          dateFrom={dateFrom}
          onDateFromChange={onDateFromChange}
          dateTo={dateTo}
          onDateToChange={onDateToChange}
          sortBy={sortBy}
          onSortByChange={onSortByChange}
          onApplyFilters={onApplyFilters}
        />
      )}
    </div>
  );
});
