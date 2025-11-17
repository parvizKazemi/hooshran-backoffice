import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "../../types";
import { UserNameCell } from "./user-name-cell";
import { UserRoleCell } from "./user-role-cell";
import { UserStatusCell } from "./user-status-cell";
import { UserActionsCell } from "./user-actions-cell";

type UseUsersTableColumnsProps = {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
};

export function useUsersTableColumns({
  onEdit,
  onDelete,
}: UseUsersTableColumnsProps): ColumnDef<User>[] {
  const { t } = useTranslation("common");

  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "fullName",
      header: t("users.name"),
      cell: ({ row }) => <UserNameCell user={row.original} />,
    },
    {
      accessorKey: "phone",
      header: t("users.phone"),
      cell: ({ row }) => {
        const phone = row.original.phoneNumber || row.original.phone;
        return phone || "-";
      },
    },
    {
      accessorKey: "role",
      header: t("users.role"),
      cell: ({ row }) => <UserRoleCell user={row.original} />,
    },
    {
      accessorKey: "status",
      header: t("users.status"),
      cell: ({ row }) => <UserStatusCell user={row.original} />,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <UserActionsCell
          user={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    },
  ];
}
