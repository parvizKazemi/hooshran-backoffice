import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconPackage } from "@tabler/icons-react";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useSearchParams } from "react-router-dom";
import { PackagesTable } from "./components/packages-table";
import { usePackages } from "./hooks/use-packages";
import { ServiceShowcaseTab } from "./showcase/components/service-showcase-tab";
import { PackagesQueryParams } from "./types";

interface PackagesProps {
  defaultTab?: "packages" | "showcase";
}

export default function Packages({ defaultTab }: PackagesProps) {
  const { t } = useTranslation("common");
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const isShowcaseRoute = location.pathname.includes("/showcase");
  const tabFromUrl = searchParams.get("tab");

  const resolvedInitialTab =
    isShowcaseRoute || defaultTab === "showcase" || tabFromUrl === "showcase"
      ? "showcase"
      : "packages";

  const [activeTab, setActiveTab] = useState<string>(resolvedInitialTab);

  useEffect(() => {
    if (
      isShowcaseRoute ||
      defaultTab === "showcase" ||
      tabFromUrl === "showcase"
    ) {
      setActiveTab("showcase");
    } else if (tabFromUrl === "packages") {
      setActiveTab("packages");
    }
  }, [isShowcaseRoute, defaultTab, tabFromUrl]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newTab === "packages") {
        next.delete("tab");
      } else {
        next.set("tab", newTab);
      }
      return next;
    });
  };

  const specialOfferFromUrl = searchParams.get("specialOffer") === "true";
  const [filters, setFilters] = useState<PackagesQueryParams>({
    page: 1,
    limit: 50,
    isSpecialOffer: specialOfferFromUrl || undefined,
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      isSpecialOffer: specialOfferFromUrl || undefined,
      page: 1,
    }));
  }, [specialOfferFromUrl]);

  const { data, isLoading, refetch } = usePackages(filters);
  const packages = data?.data || [];
  const total = data?.total || 0;
  const currentPage = data?.page || 1;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">
          {activeTab === "showcase"
            ? t(
                "packages.showcase.title",
                "پیکربندی ویترین سرویس‌ها و هزینه‌ها"
              )
            : t("packages.title", "پکیج‌های اعتباری")}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {activeTab === "showcase"
            ? t(
                "packages.showcase.description",
                "مدیریت ترتیب نمایش، اولویت و پین کردن سرویس‌ها در ویترین کاربری"
              )
            : t("packages.description")}
        </p>
      </div>

      {/* Sub-menu Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="gap-6">
        <TabsList className="bg-muted/40 h-auto w-full justify-start gap-2 overflow-x-auto rounded-2xl p-2">
          <TabsTrigger
            value="packages"
            className="cursor-pointer rounded-xl px-4 py-2.5 text-xs font-bold sm:text-sm"
          >
            <IconPackage className="me-1.5 size-4" />
            {t("packages.tabs.creditPackages", "پکیج‌های اعتباری")}
          </TabsTrigger>
          <TabsTrigger
            value="showcase"
            className="cursor-pointer rounded-xl px-4 py-2.5 text-xs font-bold sm:text-sm"
          >
            <Sparkles className="me-1.5 size-4" />
            {t("packages.tabs.serviceShowcase", "مدیریت نمایش سرویس‌ها")}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Credit Packages Table */}
        <TabsContent value="packages" className="focus-visible:outline-none">
          <PackagesTable
            data={packages}
            isLoading={isLoading}
            onRefresh={() => refetch()}
            filters={filters}
            onFiltersChange={setFilters}
            pagination={{
              page: currentPage,
              total: total,
              totalPages: totalPages,
              limit: filters.limit || 50,
            }}
          />
        </TabsContent>

        {/* Tab 2: Service Showcase Management */}
        <TabsContent value="showcase" className="focus-visible:outline-none">
          <ServiceShowcaseTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
