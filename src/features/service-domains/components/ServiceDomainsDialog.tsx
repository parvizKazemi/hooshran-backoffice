import { IconLoader2, IconTrash, IconCheck } from "@tabler/icons-react";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  useAllowedDomains,
  useCreateAllowedDomain,
  useUpdateAllowedDomain,
  useDeleteAllowedDomain,
} from "../hooks/use-allowed-domains";
import { AllowedDomain } from "../types";

// URL validation - validates full URL format (https://example.com or http://localhost:3000)
const urlRegex =
  /^https?:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?::\d+)?(?:\/.*)?$/i;

// Domain validation regex
const domainRegex =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

// Validate domain format
const validateDomain = (value: string): string | null => {
  if (!value || value.trim() === "") return null;
  const trimmed = value.trim();
  const isDomain = domainRegex.test(trimmed);
  const isUrl = urlRegex.test(trimmed);
  if (!isDomain && !isUrl) {
    return "فرمت دامنه نامعتبر است (مثال: https://aiapi.hooshran.com یا aiapi.hooshran.com)";
  }
  return null;
};

type ServiceDomainsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DEFAULT_DOMAIN = "https://aiapi.hooshran.com";

// Extract domain part from URL for display (remove protocol and trailing slash)
const extractDomain = (url: string): string => {
  return url
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "")
    .trim();
};

// Convert domain to full URL format (add https:// if missing)فعا
const ensureFullUrl = (domain: string): string => {
  const trimmed = domain.trim();
  // If it already has protocol, return as is (but clean trailing slash)
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/$/, "");
  }
  // Otherwise, add https://
  return `https://${trimmed}`;
};

export function ServiceDomainsDialog({
  open,
  onOpenChange,
}: ServiceDomainsDialogProps) {
  // Fetch all existing domains (both AD and SRU)
  const {
    data: existingDomains,
    isLoading: isLoadingDomains,
    refetch,
  } = useAllowedDomains();

  const createDomain = useCreateAllowedDomain();
  const updateDomain = useUpdateAllowedDomain();
  const deleteDomain = useDeleteAllowedDomain();

  // Get domains sorted by creation date
  const sortedDomains = useMemo(() => {
    const domains = existingDomains || [];
    return [...domains].sort((a, b) => {
      return (
        new Date(a.createdAt || 0).getTime() -
        new Date(b.createdAt || 0).getTime()
      );
    });
  }, [existingDomains]);

  // State for each domain input
  const [domain1, setDomain1] = useState("");
  const [domain2, setDomain2] = useState("");
  const [domain3, setDomain3] = useState("");
  const [type1, setType1] = useState<"AD" | "SRU">("SRU");
  const [type2, setType2] = useState<"AD" | "SRU">("SRU");
  const [type3, setType3] = useState<"AD" | "SRU">("SRU");
  const [isActive1, setIsActive1] = useState(true);
  const [isActive2, setIsActive2] = useState(true);
  const [isActive3, setIsActive3] = useState(true);
  const [domain1Error, setDomain1Error] = useState<string | null>(null);
  const [domain2Error, setDomain2Error] = useState<string | null>(null);
  const [domain3Error, setDomain3Error] = useState<string | null>(null);

  // Initialize form values when domains are loaded
  useEffect(() => {
    if (open && sortedDomains.length > 0) {
      const domain1Data = sortedDomains[0];
      const domain2Data = sortedDomains[1];
      const domain3Data = sortedDomains[2];

      setDomain1(
        domain1Data?.domain
          ? extractDomain(domain1Data.domain)
          : extractDomain(DEFAULT_DOMAIN)
      );
      setType1(domain1Data?.type || "SRU");
      setIsActive1(domain1Data?.isActive ?? true);

      setDomain2(domain2Data?.domain ? extractDomain(domain2Data.domain) : "");
      setType2(domain2Data?.type || "SRU");
      setIsActive2(domain2Data?.isActive ?? true);

      setDomain3(domain3Data?.domain ? extractDomain(domain3Data.domain) : "");
      setType3(domain3Data?.type || "SRU");
      setIsActive3(domain3Data?.isActive ?? true);
    } else if (open && sortedDomains.length === 0) {
      // No domains exist, set default for domain1
      setDomain1(extractDomain(DEFAULT_DOMAIN));
      setType1("SRU");
      setIsActive1(true);
      setDomain2("");
      setType2("SRU");
      setIsActive2(true);
      setDomain3("");
      setType3("SRU");
      setIsActive3(true);
    }
  }, [open, sortedDomains]);

  // Get domain by index
  const getDomainByIndex = (index: number): AllowedDomain | undefined => {
    return sortedDomains[index];
  };

  // Handle save/update for a specific domain
  const handleSaveDomain = async (
    index: 1 | 2 | 3,
    domainValue: string,
    type: "AD" | "SRU",
    isActive: boolean
  ) => {
    // Validate
    const error = validateDomain(domainValue);
    if (index === 1 && error) {
      setDomain1Error(error);
      return;
    }
    if (index === 2 && error) {
      setDomain2Error(error);
      return;
    }
    if (index === 3 && error) {
      setDomain3Error(error);
      return;
    }

    if (!domainValue || domainValue.trim() === "") {
      if (index === 1) {
        setDomain1Error("دامنه اول الزامی است");
      }
      return;
    }

    // Clear errors
    if (index === 1) setDomain1Error(null);
    if (index === 2) setDomain2Error(null);
    if (index === 3) setDomain3Error(null);

    const fullUrl = ensureFullUrl(domainValue.trim());
    const existingDomain = getDomainByIndex(index - 1);

    try {
      if (existingDomain) {
        // Update existing domain
        await updateDomain.mutateAsync({
          uuid: existingDomain.uuid,
          data: {
            domain: fullUrl,
            isActive,
          },
        });
      } else {
        // Create new domain
        await createDomain.mutateAsync({
          domain: fullUrl,
          type,
        });
      }
      // Refetch to update the list
      await refetch();
    } catch (error) {
      // Error handling is done in the hooks
      console.error(`Error saving domain ${index}:`, error);
    }
  };

  // Handle delete for a specific domain
  const handleDeleteDomain = async (index: 1 | 2 | 3) => {
    const existingDomain = getDomainByIndex(index - 1);
    if (!existingDomain) return;

    try {
      await deleteDomain.mutateAsync(existingDomain.uuid);
      // Clear the input and reset state
      if (index === 1) {
        setDomain1("");
        setType1("SRU");
        setIsActive1(true);
      }
      if (index === 2) {
        setDomain2("");
        setType2("SRU");
        setIsActive2(true);
      }
      if (index === 3) {
        setDomain3("");
        setType3("SRU");
        setIsActive3(true);
      }
      // Refetch to update the list
      await refetch();
    } catch (error) {
      // Error handling is done in the hooks
      console.error(`Error deleting domain ${index}:`, error);
    }
  };

  const isLoading =
    isLoadingDomains ||
    createDomain.isPending ||
    updateDomain.isPending ||
    deleteDomain.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>تنظیمات دامنه‌های سرویس</DialogTitle>
          <DialogDescription>
            دامنه‌های مورد استفاده برای درخواست به سرویس‌ها را تنظیم کنید. در
            صورت خطای سرور (5xx) از دامنه بعدی استفاده می‌شود.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <FieldGroup>
            {/* Domain 1 */}
            <Field>
              <FieldLabel htmlFor="domain1">
                دامنه اول <span className="text-destructive">*</span>
              </FieldLabel>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="domain1"
                    type="text"
                    dir="ltr"
                    className="flex-1 text-left"
                    placeholder="https://aiapi.hooshran.com"
                    value={domain1}
                    onChange={(e) => {
                      setDomain1(e.target.value);
                      setDomain1Error(null);
                    }}
                    disabled={isLoading}
                  />
                  {getDomainByIndex(0) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteDomain(1)}
                      disabled={isLoading}
                      title="حذف دامنه"
                    >
                      <IconTrash className="size-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={() =>
                      handleSaveDomain(1, domain1, type1, isActive1)
                    }
                    disabled={isLoading || !domain1.trim()}
                    title={getDomainByIndex(0) ? "ویرایش" : "اضافه کردن"}
                  >
                    {isLoading ? (
                      <IconLoader2 className="size-4 animate-spin" />
                    ) : (
                      <IconCheck className="size-4" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FieldLabel htmlFor="type1" className="text-sm">
                      نوع:
                    </FieldLabel>
                    <Select
                      value={type1}
                      onValueChange={(value: "AD" | "SRU") => setType1(value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SRU">SRU</SelectItem>
                        <SelectItem value="AD">AD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <FieldLabel htmlFor="isActive1" className="text-sm">
                      فعال:
                    </FieldLabel>
                    <Switch
                      dir="ltr"
                      id="isActive1"
                      checked={isActive1}
                      onCheckedChange={setIsActive1}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
              {domain1Error && (
                <FieldDescription className="text-destructive">
                  {domain1Error}
                </FieldDescription>
              )}
              <FieldDescription>
                دامنه اولیه برای ارسال درخواست‌ها (الزامی)
              </FieldDescription>
            </Field>

            {/* Domain 2 */}
            <Field>
              <FieldLabel htmlFor="domain2">دامنه دوم (اختیاری)</FieldLabel>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="domain2"
                    type="text"
                    dir="ltr"
                    className="flex-1 text-left"
                    placeholder="https://proxy.hooshran.com"
                    value={domain2}
                    onChange={(e) => {
                      setDomain2(e.target.value);
                      setDomain2Error(null);
                    }}
                    disabled={isLoading}
                  />
                  {getDomainByIndex(1) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteDomain(2)}
                      disabled={isLoading}
                      title="حذف دامنه"
                    >
                      <IconTrash className="size-4" />
                    </Button>
                  )}
                  {domain2.trim() && (
                    <Button
                      type="button"
                      onClick={() =>
                        handleSaveDomain(2, domain2, type2, isActive2)
                      }
                      disabled={isLoading}
                      title={getDomainByIndex(1) ? "ویرایش" : "اضافه کردن"}
                    >
                      {isLoading ? (
                        <IconLoader2 className="size-4 animate-spin" />
                      ) : (
                        <IconCheck className="size-4" />
                      )}
                    </Button>
                  )}
                </div>
                {domain2.trim() && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <FieldLabel htmlFor="type2" className="text-sm">
                        نوع:
                      </FieldLabel>
                      <Select
                        value={type2}
                        onValueChange={(value: "AD" | "SRU") => setType2(value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SRU">SRU</SelectItem>
                          <SelectItem value="AD">AD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <FieldLabel htmlFor="isActive2" className="text-sm">
                        فعال:
                      </FieldLabel>
                      <Switch
                        dir="ltr"
                        id="isActive2"
                        checked={isActive2}
                        onCheckedChange={setIsActive2}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}
              </div>
              {domain2Error && (
                <FieldDescription className="text-destructive">
                  {domain2Error}
                </FieldDescription>
              )}
              <FieldDescription>
                در صورت خطای سرور از دامنه اول، از این دامنه استفاده می‌شود
              </FieldDescription>
            </Field>

            {/* Domain 3 */}
            <Field>
              <FieldLabel htmlFor="domain3">دامنه سوم (اختیاری)</FieldLabel>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="domain3"
                    type="text"
                    dir="ltr"
                    className="flex-1 text-left"
                    placeholder="https://backup.hooshran.com"
                    value={domain3}
                    onChange={(e) => {
                      setDomain3(e.target.value);
                      setDomain3Error(null);
                    }}
                    disabled={isLoading}
                  />
                  {getDomainByIndex(2) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteDomain(3)}
                      disabled={isLoading}
                      title="حذف دامنه"
                    >
                      <IconTrash className="size-4" />
                    </Button>
                  )}
                  {domain3.trim() && (
                    <Button
                      type="button"
                      onClick={() =>
                        handleSaveDomain(3, domain3, type3, isActive3)
                      }
                      disabled={isLoading}
                      title={getDomainByIndex(2) ? "ویرایش" : "اضافه کردن"}
                    >
                      {isLoading ? (
                        <IconLoader2 className="size-4 animate-spin" />
                      ) : (
                        <IconCheck className="size-4" />
                      )}
                    </Button>
                  )}
                </div>
                {domain3.trim() && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <FieldLabel htmlFor="type3" className="text-sm">
                        نوع:
                      </FieldLabel>
                      <Select
                        value={type3}
                        onValueChange={(value: "AD" | "SRU") => setType3(value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SRU">SRU</SelectItem>
                          <SelectItem value="AD">AD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <FieldLabel htmlFor="isActive3" className="text-sm">
                        فعال:
                      </FieldLabel>
                      <Switch
                        dir="ltr"
                        id="isActive3"
                        checked={isActive3}
                        onCheckedChange={setIsActive3}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}
              </div>
              {domain3Error && (
                <FieldDescription className="text-destructive">
                  {domain3Error}
                </FieldDescription>
              )}
              <FieldDescription>
                در صورت خطای سرور از دامنه دوم، از این دامنه استفاده می‌شود
              </FieldDescription>
            </Field>
          </FieldGroup>
        </div>
      </DialogContent>
    </Dialog>
  );
}
