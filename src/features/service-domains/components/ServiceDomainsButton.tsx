import { useState } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceDomainsDialog } from "./ServiceDomainsDialog";

export function ServiceDomainsButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsDialogOpen(true)}
        className="flex cursor-pointer items-center justify-center rounded-md bg-gray-200 p-2 dark:bg-gray-800 dark:text-white"
        aria-label="تنظیمات دامنه‌های سرویس"
        title="تنظیمات دامنه‌های سرویس"
      >
        <Globe size={20} />
      </Button>
      <ServiceDomainsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
