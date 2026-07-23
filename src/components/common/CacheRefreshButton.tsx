import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiPost, ApiError } from "@/services/api";
import { toast } from "sonner";

type CacheWarmType = "api-service" | "all";

export function CacheRefreshButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async (type: CacheWarmType) => {
    setIsLoading(true);
    try {
      await apiPost(`/admin/cache/warm?type=${type}`);
      toast.success(
        type === "api-service"
          ? "کش سرویس‌ها با موفقیت به‌روزرسانی شد"
          : "همه کش با موفقیت به‌روزرسانی شد"
      );
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در به‌روزرسانی کش");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={isLoading}
          className="flex cursor-pointer items-center justify-center rounded-md bg-gray-200 p-2 disabled:opacity-50 dark:bg-gray-800 dark:text-white"
          aria-label="به‌روزرسانی کش"
          title="به‌روزرسانی کش"
        >
          <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={isLoading}
          onClick={() => handleRefresh("api-service")}
        >
          فقط کش سرویس‌ها
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isLoading}
          onClick={() => handleRefresh("all")}
        >
          همه کش
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
