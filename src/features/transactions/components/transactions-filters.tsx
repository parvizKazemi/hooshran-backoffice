// فیلترهای تراکنش‌ها
// - جستجو (debounced) + انتخاب درگاه/وضعیت
// - هر تغییر فوراً از طریق onChange به والد اعمال می‌شود
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import type { TransactionsFilters } from "../types";

export function TransactionsFilters({
  value,
  onChange,
}: {
  value: TransactionsFilters;
  onChange: (next: TransactionsFilters) => void;
}) {
  const { t } = useTranslation("common");
  const [q, setQ] = useState(value.q || "");
  const [gateway, setGateway] = useState(value.gateway || "all");
  const [status, setStatus] = useState<TransactionsFilters["status"]>(
    (value.status || "all") as TransactionsFilters["status"]
  );

  useEffect(() => {
    setQ(value.q || "");
    setGateway(value.gateway || "all");
    setStatus((value.status || "all") as TransactionsFilters["status"]);
  }, [value]);

  useEffect(() => {
    const t = setTimeout(() => {
      onChange({ ...value, q: q || undefined, page: 1 });
    }, 400);
    return () => clearTimeout(t);
  }, [q]);

  const gateways = useMemo(
    () => ["all", "zarinpal", "idpay", "saman", "mellat", "parsian"],
    []
  );

  return (
    <FieldGroup className="grid-cols-1 gap-3 sm:grid-cols-3">
      <Field>
        <FieldLabel>{t("transactions.search")}</FieldLabel>
        <Input
          placeholder={t("transactions.searchPlaceholder")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel>{t("transactions.gateway")}</FieldLabel>
        <Select
          value={gateway}
          onValueChange={(val) =>
            onChange({
              ...value,
              gateway: val === "all" ? undefined : val,
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("transactions.selectGateway")} />
          </SelectTrigger>
          <SelectContent>
            {gateways.map((g) => (
              <SelectItem key={g} value={g}>
                {g === "all" ? t("transactions.all") : g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel>{t("transactions.status")}</FieldLabel>
        <Select
          value={status as string}
          onValueChange={(val) =>
            onChange({
              ...value,
              status: (val as TransactionsFilters["status"]) || "all",
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("transactions.selectStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("transactions.statuses.all")}
            </SelectItem>
            <SelectItem value="success">
              {t("transactions.statuses.success")}
            </SelectItem>
            <SelectItem value="failed">
              {t("transactions.statuses.failed")}
            </SelectItem>
            <SelectItem value="pending">
              {t("transactions.statuses.pending")}
            </SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </FieldGroup>
  );
}
