import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SettingsPageHeader } from "./components/settings-page-header";
import { BlacklistBlockDialog } from "./components/blacklist/blacklist-block-dialog";
import { BlacklistTable } from "./components/blacklist/blacklist-table";
import { BlacklistUnblockDialog } from "./components/blacklist/blacklist-unblock-dialog";
import {
  useBanUser,
  useBannedUsers,
  useUnbanUser,
  useUpdateBannedUser,
} from "./hooks/use-blacklist";
import type { BannedUsersQueryParams, BlacklistRecord } from "./types";

export default function UserBlacklistSettings() {
  const { t } = useTranslation("common");
  const [filters, setFilters] = useState<BannedUsersQueryParams>({
    page: 1,
    take: 10,
  });

  const { data, isLoading } = useBannedUsers(filters);
  const banUser = useBanUser();
  const updateBannedUser = useUpdateBannedUser();
  const unbanUser = useUnbanUser();

  const records = data?.data ?? [];
  const meta = data?.meta;
  const currentPage = meta?.page ?? 1;
  const totalPages = meta?.pageCount ?? 1;
  const total = meta?.itemCount ?? 0;

  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [blockDialogMode, setBlockDialogMode] = useState<"create" | "edit">(
    "create"
  );
  const [selectedRecord, setSelectedRecord] = useState<BlacklistRecord | null>(
    null
  );
  const [unblockDialogOpen, setUnblockDialogOpen] = useState(false);
  const [recordToUnblock, setRecordToUnblock] =
    useState<BlacklistRecord | null>(null);

  const isSubmitting =
    banUser.isPending || updateBannedUser.isPending || unbanUser.isPending;

  const handleOpenCreate = () => {
    setBlockDialogMode("create");
    setSelectedRecord(null);
    setBlockDialogOpen(true);
  };

  const handleOpenEdit = (record: BlacklistRecord) => {
    setBlockDialogMode("edit");
    setSelectedRecord(record);
    setBlockDialogOpen(true);
  };

  const handleOpenUnblock = (record: BlacklistRecord) => {
    setRecordToUnblock(record);
    setUnblockDialogOpen(true);
  };

  const handleBlockSubmit = async (payload: {
    phoneNumber: string;
    banningReason: string;
    uuid?: string;
  }) => {
    if (blockDialogMode === "edit" && payload.uuid) {
      await updateBannedUser.mutateAsync({
        uuid: payload.uuid,
        banningReason: payload.banningReason,
      });
    } else {
      await banUser.mutateAsync({
        phoneNumber: payload.phoneNumber,
        banningReason: payload.banningReason,
      });
    }

    setBlockDialogOpen(false);
    setSelectedRecord(null);
  };

  const handleUnblockConfirm = async () => {
    if (!recordToUnblock) {
      return;
    }

    await unbanUser.mutateAsync(recordToUnblock.uuid);
    setUnblockDialogOpen(false);
    setRecordToUnblock(null);
  };

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <SettingsPageHeader
        title={t("userSettings.blacklistPage.header.title")}
        description={t("userSettings.blacklistPage.header.description")}
      />

      <BlacklistTable
        data={records}
        isLoading={isLoading}
        filters={filters}
        onFiltersChange={setFilters}
        pagination={{
          page: currentPage,
          total,
          totalPages,
          take: meta?.take ?? filters.take ?? 10,
        }}
        onAdd={handleOpenCreate}
        onEdit={handleOpenEdit}
        onUnblock={handleOpenUnblock}
      />

      <BlacklistBlockDialog
        open={blockDialogOpen}
        onOpenChange={setBlockDialogOpen}
        mode={blockDialogMode}
        record={selectedRecord}
        isSubmitting={isSubmitting}
        onSubmit={handleBlockSubmit}
      />

      <BlacklistUnblockDialog
        open={unblockDialogOpen}
        onOpenChange={setUnblockDialogOpen}
        phoneNumber={recordToUnblock?.phoneNumber}
        isSubmitting={unbanUser.isPending}
        onConfirm={handleUnblockConfirm}
      />
    </div>
  );
}
