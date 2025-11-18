import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { IconChevronDown } from "@tabler/icons-react";
import { memo } from "react";
import { useTranslation } from "react-i18next";

type UsersSearchBarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
};

export const UsersSearchBar = memo(function UsersSearchBar({
  searchQuery,
  onSearchChange,
  showAdvancedFilters,
  onToggleAdvancedFilters,
}: UsersSearchBarProps) {
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-1 items-center gap-2">
      <Input
        placeholder={t("users.search")}
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        className="w-fit min-w-sm"
      />
      <Button
        type="button"
        variant="outline"
        onClick={onToggleAdvancedFilters}
        className="gap-2"
      >
        {t("users.filters.showAdvanced")}
        <IconChevronDown
          className={cn("size-4", showAdvancedFilters ? "rotate-180" : "")}
        />
      </Button>
    </div>
  );
});
