// صفحه تراکنش‌ها
// - فیلترها و جستجوی آنی (client-side)
// - جدول نتایج با pagination سمت کلاینت
// - الگوی چیدمان مشابه سایر صفحات (Sidebar + Header + Content)
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  mockTransactions,
  type TransactionsFilters,
  type Transaction,
} from "./types";
import { TransactionsFilters as Filters } from "./components/transactions-filters";
import { TransactionsTable } from "./components/transactions-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Transactions() {
  const { t } = useTranslation("common");
  // وضعیت فیلترهای صفحه
  const [filters, setFilters] = useState<TransactionsFilters>({
    page: 1,
    take: 10,
    status: "all",
  });

  // فیلتر کردن لیست تراکنش‌ها در کلاینت (به‌سادگی قابل جایگزینی با API)
  const filtered: Transaction[] = useMemo(() => {
    const q = (filters.q || "").toLowerCase().trim();
    return mockTransactions.filter((t) => {
      const matchesQ = q
        ? (t.id + (t.refId || "") + (t.userPhone || "") + t.gateway)
            .toLowerCase()
            .includes(q)
        : true;
      const matchesGateway = filters.gateway
        ? t.gateway === filters.gateway
        : true;
      const matchesStatus =
        filters.status && filters.status !== "all"
          ? t.status === filters.status
          : true;
      return matchesQ && matchesGateway && matchesStatus;
    });
  }, [filters]);

  // محاسبه داده‌های صفحه فعلی
  const page = filters.page || 1;
  const take = filters.take || 10;
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / take));
  const pageData = filtered.slice((page - 1) * take, page * take);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" side="right" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="flex flex-col gap-4 px-4 lg:px-6">
                <div className="mb-4">
                  <h1 className="text-2xl font-bold">
                    {t("transactions.title")}
                  </h1>
                  <p className="text-muted-foreground mt-3 text-sm">
                    {t("transactions.description")}
                  </p>
                </div>

                {/* فرم فیلترها - جستجو debounce شده و سایر فیلدها آنی اعمال می‌شوند */}
                <Filters value={filters} onChange={setFilters} />

                {/* جدول نتایج صفحه فعلی */}
                <TransactionsTable data={pageData} />

                {/* کنترل‌های صفحه‌بندی */}
                <div className="flex items-center justify-between px-2">
                  <div className="text-muted-foreground text-sm">
                    {t("transactions.page")} {page} {t("transactions.of")}{" "}
                    {totalPages} ({total} {t("transactions.items")})
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFilters((f) => ({
                          ...f,
                          page: Math.max(1, (f.page || 1) - 1),
                        }))
                      }
                      disabled={page <= 1}
                    >
                      {t("transactions.prev")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFilters((f) => ({
                          ...f,
                          page: Math.min(totalPages, (f.page || 1) + 1),
                        }))
                      }
                      disabled={page >= totalPages}
                    >
                      {t("transactions.next")}
                    </Button>
                    <Select
                      value={String(take)}
                      onValueChange={(v) =>
                        setFilters((f) => ({ ...f, take: Number(v), page: 1 }))
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[10, 20, 30, 50, 100].map((size) => (
                          <SelectItem key={size} value={String(size)}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
