import { useState } from "react";
import { User } from "../../types";

export function useUsersTableState() {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(
    null
  );

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setEditingUser(null);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsDrawerOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    if (!user.uuid) return;
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleResetPasswordDialogOpen = (user: User) => {
    if (!user.uuid) return;
    setUserToResetPassword(user);
    setResetPasswordDialogOpen(true);
  };

  const handleResetPasswordDialogClose = () => {
    setResetPasswordDialogOpen(false);
    setUserToResetPassword(null);
  };

  return {
    editingUser,
    isDrawerOpen,
    setIsDrawerOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    userToDelete,
    resetPasswordDialogOpen,
    setResetPasswordDialogOpen,
    userToResetPassword,
    handleCreateUser,
    handleDrawerClose,
    handleEditUser,
    handleDeleteUser,
    handleDeleteDialogClose,
    handleResetPasswordDialogOpen,
    handleResetPasswordDialogClose,
  };
}
