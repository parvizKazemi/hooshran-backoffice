import {
  IconLoader2,
  IconTrash,
  IconPlus,
  IconEdit,
  IconCheck,
  IconX,
  IconActivity,
} from "@tabler/icons-react";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAllowedDomains,
  useCreateAllowedDomain,
  useUpdateAllowedDomain,
  useDeleteAllowedDomain,
} from "../hooks/use-allowed-domains";
import { AllowedDomain } from "../types";
import { TFunction } from "i18next";

// URL validation - validates full URL format (https://example.com or http://localhost:3000)
const urlRegex =
  /^https?:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?::\d+)?(?:\/.*)?$/i;

// Domain validation regex
const domainRegex =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

// Validate domain format
const validateDomain = (value: string, t: TFunction): string | null => {
  if (!value || value.trim() === "") return null;
  const trimmed = value.trim();
  const isDomain = domainRegex.test(trimmed);
  const isUrl = urlRegex.test(trimmed);
  if (!isDomain && !isUrl) {
    return t("domains.errors.invalidFormat");
  }
  return null;
};

type ServiceDomainsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// const DEFAULT_DOMAIN = "https://aiapi.hooshran.com";

// Extract domain part from URL for display (remove protocol and trailing slash)
const extractDomain = (url: string): string => {
  return url
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "")
    .trim();
};

// Convert domain to full URL format (add https:// if missing)
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
  const { t } = useTranslation("common");

  // Fetch all existing domains
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

  // Form state
  const [formDomain, setFormDomain] = useState("");
  const [formType, setFormType] = useState<"AD" | "SRU">("SRU");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingDomain, setEditingDomain] = useState<AllowedDomain | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form
  const resetForm = () => {
    setFormDomain("");
    setFormType("SRU");
    setFormIsActive(true);
    setFormError(null);
    setEditingDomain(null);
  };

  // Load domain into form for editing
  const handleEditDomain = (domain: AllowedDomain) => {
    setEditingDomain(domain);
    setFormDomain(extractDomain(domain.domain));
    setFormType(domain.type);
    setFormIsActive(domain.isActive || false);
    setFormError(null);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    resetForm();
  };

  // Submit form (create or update)
  const handleSubmit = async () => {
    // Validate
    const error = validateDomain(formDomain, t);
    if (error) {
      setFormError(error);
      return;
    }

    if (!formDomain || formDomain.trim() === "") {
      setFormError(t("domains.errors.required"));
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    const fullUrl = ensureFullUrl(formDomain.trim());

    try {
      if (editingDomain) {
        // Update existing domain
        await updateDomain.mutateAsync({
          uuid: editingDomain.uuid,
          data: {
            domain: fullUrl,
            type: formType,
            isActive: formIsActive,
          },
        });
      } else {
        // Create new domain
        await createDomain.mutateAsync({
          domain: fullUrl,
          type: formType,
        });
      }
      // Refetch to update the list
      await refetch();
      // Reset form
      resetForm();
    } catch (error) {
      console.error("Error saving domain:", error);
      setFormError(t("domains.errors.saveFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDeleteDomain = async (domain: AllowedDomain) => {
    if (!confirm(t("domains.confirmDelete"))) return;

    try {
      await deleteDomain.mutateAsync(domain.uuid);
      await refetch();
      // If we were editing this domain, reset form
      if (editingDomain?.uuid === domain.uuid) {
        resetForm();
      }
    } catch (error) {
      console.error("Error deleting domain:", error);
    }
  };

  // Test domain connection (placeholder for future implementation)
  const handleTestDomain = async (domain: AllowedDomain) => {
    // TODO: Implement domain testing
    // This will send a request to the domain and return:
    // - Response status code
    // - Response time
    // - Any relevant info
    console.warn("Testing domain:", domain.domain);
    alert(t("domains.testNotImplemented"));
  };

  const isLoading = isLoadingDomains || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("domains.title")}</DialogTitle>
          <DialogDescription>{t("domains.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Form Section */}
          <div className="bg-muted/30 rounded-lg border p-4">
            <h3 className="mb-4 text-sm font-medium">
              {editingDomain
                ? t("domains.form.editTitle")
                : t("domains.form.addTitle")}
            </h3>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="domain">
                  {t("domains.form.domainLabel")}
                </FieldLabel>
                <div className="flex gap-2">
                  <Select
                    value={formType}
                    onValueChange={(value: "AD" | "SRU") => setFormType(value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SRU">SRU</SelectItem>
                      <SelectItem value="AD">AD</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 rounded-md border px-3">
                    <span className="text-sm whitespace-nowrap">
                      {t("domains.form.activeLabel")}:
                    </span>
                    <Switch
                      dir="ltr"
                      checked={formIsActive}
                      onCheckedChange={setFormIsActive}
                      disabled={isLoading}
                    />
                  </div>
                  <Input
                    id="domain"
                    type="text"
                    dir="ltr"
                    className="flex-1 text-left"
                    placeholder="https://aiapi.hooshran.com"
                    value={formDomain}
                    onChange={(e) => {
                      setFormDomain(e.target.value);
                      setFormError(null);
                    }}
                    disabled={isLoading}
                  />
                </div>
                {formError && (
                  <FieldDescription className="text-destructive">
                    {formError}
                  </FieldDescription>
                )}
                <FieldDescription>
                  {t("domains.form.domainHint")}
                </FieldDescription>
              </Field>

              <div className="flex gap-2">
                {editingDomain && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                  >
                    <IconX className="mr-2 size-4" />
                    {t("domains.form.cancel")}
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading || !formDomain.trim()}
                >
                  {isLoading ? (
                    <IconLoader2 className="mr-2 size-4 animate-spin" />
                  ) : editingDomain ? (
                    <IconCheck className="mr-2 size-4" />
                  ) : (
                    <IconPlus className="mr-2 size-4" />
                  )}
                  {editingDomain
                    ? t("domains.form.update")
                    : t("domains.form.add")}
                </Button>
              </div>
            </FieldGroup>
          </div>

          {/* Domains Table */}
          <div>
            <h3 className="mb-3 text-sm font-medium">
              {t("domains.table.title")}
            </h3>
            {sortedDomains.length === 0 ? (
              <div className="text-muted-foreground rounded-lg border py-8 text-center">
                {t("domains.table.empty")}
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="text-center">
                        {t("domains.table.domain")}
                      </TableHead>
                      <TableHead className="w-24 text-center">
                        {t("domains.table.type")}
                      </TableHead>
                      <TableHead className="w-24 text-center">
                        {t("domains.table.status")}
                      </TableHead>
                      <TableHead className="w-32 text-center">
                        {t("domains.table.actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedDomains.map((domain) => (
                      <TableRow
                        key={domain.uuid}
                        className={
                          editingDomain?.uuid === domain.uuid
                            ? "bg-primary/5"
                            : ""
                        }
                      >
                        <TableCell className="font-mono text-sm" dir="ltr">
                          {domain.domain}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              domain.type === "SRU" ? "default" : "secondary"
                            }
                            className={
                              domain.type === "SRU"
                                ? "bg-blue-500 hover:bg-blue-600"
                                : "bg-purple-500 hover:bg-purple-600"
                            }
                          >
                            {domain.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={domain.isActive ? "default" : "outline"}
                            className={
                              domain.isActive
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-gray-400 hover:bg-gray-500"
                            }
                          >
                            {domain.isActive
                              ? t("domains.status.active")
                              : t("domains.status.inactive")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleTestDomain(domain)}
                              disabled={true} // Disabled for now
                              title={t("domains.actions.test")}
                            >
                              <IconActivity className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditDomain(domain)}
                              disabled={isLoading}
                              title={t("domains.actions.edit")}
                            >
                              <IconEdit className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteDomain(domain)}
                              disabled={isLoading}
                              title={t("domains.actions.delete")}
                            >
                              <IconTrash className="text-destructive size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
