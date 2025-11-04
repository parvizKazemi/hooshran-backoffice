import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2 } from "@tabler/icons-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
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
import { createUserSchema, CreateUserInput, User } from "../types";
import { useCreateUser, useUpdateUser } from "../hooks/use-users";

type UserFormProps = {
  user?: User;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const isEditing = !!user;
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: user
      ? {
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          role: user.role,
          status: user.status,
        }
      : {
          name: "",
          email: "",
          phone: "",
          role: "user",
          status: "active",
        },
  });

  const onSubmit = async (data: CreateUserInput) => {
    if (isEditing && user) {
      await updateUser.mutateAsync({ ...data, id: user.id });
    } else {
      await createUser.mutateAsync(data);
    }
    onSuccess?.();
    if (!isEditing) {
      form.reset();
    }
  };

  const isLoading = createUser.isPending || updateUser.isPending;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">نام</FieldLabel>
          <Input
            id="name"
            {...form.register("name")}
            placeholder="نام کاربر را وارد کنید"
            disabled={isLoading}
          />
          {form.formState.errors.name && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.name.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="email">ایمیل</FieldLabel>
          <Input
            id="email"
            type="email"
            {...form.register("email")}
            placeholder="email@example.com"
            disabled={isLoading}
          />
          {form.formState.errors.email && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.email.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="phone">شماره تماس (اختیاری)</FieldLabel>
          <Input
            id="phone"
            {...form.register("phone")}
            placeholder="09123456789"
            disabled={isLoading}
          />
          {form.formState.errors.phone && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.phone.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="role">نقش</FieldLabel>
          <Select
            value={form.watch("role")}
            onValueChange={(value) =>
              form.setValue("role", value as "admin" | "user" | "moderator")
            }
            disabled={isLoading}
          >
            <SelectTrigger id="role">
              <SelectValue placeholder="انتخاب نقش" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">مدیر</SelectItem>
              <SelectItem value="moderator">ناظر</SelectItem>
              <SelectItem value="user">کاربر</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.role && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.role.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="status">وضعیت</FieldLabel>
          <Select
            value={form.watch("status")}
            onValueChange={(value) =>
              form.setValue(
                "status",
                value as "active" | "inactive" | "suspended"
              )
            }
            disabled={isLoading}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="انتخاب وضعیت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">فعال</SelectItem>
              <SelectItem value="inactive">غیرفعال</SelectItem>
              <SelectItem value="suspended">معلق</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.status && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.status.message}
            </FieldDescription>
          )}
        </Field>
      </FieldGroup>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading && <IconLoader2 className="mr-2 size-4 animate-spin" />}
          {isEditing ? "ذخیره تغییرات" : "ایجاد کاربر"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            لغو
          </Button>
        )}
      </div>
    </form>
  );
}
