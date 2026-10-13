import { Button } from "@/components/ui/button";
import { IconLayersSubtract } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  ServiceHierarchyBoard,
  ServiceHierarchyBoardSkeleton,
} from "./components/service-hierarchy-board";
import {
  useSaveServiceHierarchy,
  useServiceHierarchyCatalog,
} from "./hooks/use-service-hierarchy";

export default function ServiceHierarchy() {
  const { t } = useTranslation("common");
  const { data, isLoading } = useServiceHierarchyCatalog();
  const saveHierarchy = useSaveServiceHierarchy();

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            {t("manageServices.hierarchy.title")}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {t("manageServices.hierarchy.description")}
          </p>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <Link to="/services/manage">
            <IconLayersSubtract className="size-4" />
            {t("nav.services.manageServices")}
          </Link>
        </Button>
      </div>

      {isLoading || !data ? (
        <ServiceHierarchyBoardSkeleton />
      ) : (
        <ServiceHierarchyBoard
          services={data}
          isSaving={saveHierarchy.isPending}
          onSave={(current, baseline) =>
            saveHierarchy.mutateAsync({
              services: data,
              baseline,
              current,
            })
          }
        />
      )}
    </div>
  );
}
