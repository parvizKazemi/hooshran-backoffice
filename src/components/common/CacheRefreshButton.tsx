import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/services/api";
import { ApiError } from "@/services/api";
import { toast } from "sonner";

export function CacheRefreshButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await apiPost("/admin/cache/warm?type=all");
      toast.success("کش با موفقیت به‌روزرسانی شد");
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
    <Button
      variant="ghost"
      size="icon"
      onClick={handleRefresh}
      disabled={isLoading}
      className="flex cursor-pointer items-center justify-center rounded-md bg-gray-200 p-2 disabled:opacity-50 dark:bg-gray-800 dark:text-white"
      aria-label="به‌روزرسانی کش"
      title="به‌روزرسانی کش"
    >
      <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
    </Button>
  );
}
