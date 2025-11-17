import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { UsersQueryParams } from "../../types";

export function useUsersFilters(
  filters: UsersQueryParams,
  onFiltersChange?: (filters: UsersQueryParams) => void
) {
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Local filter states
  const [searchQuery, setSearchQuery] = useState(
    filters.search || filters.q || ""
  );
  const [qQuery, setQQuery] = useState(filters.q || "");
  const [roleFilter, setRoleFilter] = useState(filters.role || "");
  const [phoneFilter, setPhoneFilter] = useState(filters.phoneNumber || "");
  const [isActiveFilter, setIsActiveFilter] = useState<string>(
    filters.isActive !== undefined ? String(filters.isActive) : ""
  );
  const [dateFrom, setDateFrom] = useState(filters.dateFrom || "");
  const [dateTo, setDateTo] = useState(filters.dateTo || "");
  const [sortBy, setSortBy] = useState(filters.sortBy || "");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Debounce search query (1 second)
  const debouncedSearch = useDebounce(searchQuery, 1000);
  const debouncedQ = useDebounce(qQuery, 1000);

  // Update filters when props change
  useEffect(() => {
    setSearchQuery(filters.search || filters.q || "");
    setQQuery(filters.q || "");
    setRoleFilter(filters.role || "");
    setPhoneFilter(filters.phoneNumber || "");
    setIsActiveFilter(
      filters.isActive !== undefined ? String(filters.isActive) : ""
    );
    setDateFrom(filters.dateFrom || "");
    setDateTo(filters.dateTo || "");
    setSortBy(filters.sortBy || "");
  }, [filters]);

  // Apply filters to API
  const applyFilters = useCallback(
    (newFilters: Partial<UsersQueryParams>) => {
      if (onFiltersChange) {
        onFiltersChange({
          ...filtersRef.current,
          ...newFilters,
          page: 1, // Reset to first page when filtering
        });
      }
    },
    [onFiltersChange]
  );

  // Handle debounced search
  useEffect(() => {
    applyFilters({ search: debouncedSearch || undefined });
  }, [debouncedSearch, applyFilters]);

  // Handle debounced q query
  useEffect(() => {
    applyFilters({ q: debouncedQ || undefined });
  }, [debouncedQ, applyFilters]);

  return {
    // States
    searchQuery,
    setSearchQuery,
    qQuery,
    setQQuery,
    roleFilter,
    setRoleFilter,
    phoneFilter,
    setPhoneFilter,
    isActiveFilter,
    setIsActiveFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    sortBy,
    setSortBy,
    showAdvancedFilters,
    setShowAdvancedFilters,
    // Functions
    applyFilters,
  };
}
