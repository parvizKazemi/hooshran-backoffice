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
import {
  createUserSchema,
  CreateUserInput,
  UpdateUserInput,
  User,
} from "../types";
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
    defaultValues: (user
      ? {
          fullName: user.profile?.full_name || user.fullName || user.name || "",
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          phoneNumber: user.phoneNumber || "",
          role: user.role || "USER",
          status: user.status,
          isActive: user.isActive ?? true,
          registrationSource: user.registrationSource || "",
        }
      : {
          fullName: "",
          name: "",
          email: "",
          phone: "",
          phoneNumber: "",
          role: "USER",
          status: "active",
          isActive: true,
          registrationSource: "",
        }) as CreateUserInput,
  });

  const onSubmit = async (data: CreateUserInput) => {
    if (isEditing && user && user.uuid) {
      const updateData: UpdateUserInput = {
        uuid: user.uuid,
        phoneNumber: data.phoneNumber || user.phoneNumber,
        role: data.role || "USER",
        isActive: data.isActive ?? true,
        registrationSource:
          data.registrationSource || user.registrationSource || undefined,
      };
      await updateUser.mutateAsync(updateData);
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
          <FieldLabel htmlFor="fullName">نام</FieldLabel>
          <Input
            id="fullName"
            {...form.register("fullName")}
            placeholder="نام کاربر را وارد کنید"
            disabled={isLoading}
          />
          {form.formState.errors.fullName && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.fullName.message}
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
          <FieldLabel htmlFor="phoneNumber">
            شماره تماس <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="phoneNumber"
            {...form.register("phoneNumber")}
            placeholder="+989392285590"
            disabled={isLoading}
            required
          />
          {form.formState.errors.phoneNumber && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.phoneNumber.message}
            </FieldDescription>
          )}
        </Field>

        {isEditing && (
          <Field>
            <FieldLabel htmlFor="registrationSource">منبع ثبت‌نام</FieldLabel>
            <Input
              id="registrationSource"
              {...form.register("registrationSource")}
              placeholder="web, mobile, etc."
              disabled={isLoading}
            />
            {form.formState.errors.registrationSource && (
              <FieldDescription className="text-destructive">
                {form.formState.errors.registrationSource.message}
              </FieldDescription>
            )}
          </Field>
        )}

        <Field>
          <FieldLabel htmlFor="role">
            نقش <span className="text-destructive">*</span>
          </FieldLabel>
          <Select
            value={form.watch("role") || "USER"}
            onValueChange={(value) =>
              form.setValue(
                "role",
                value as "admin" | "user" | "moderator" | "USER" | "ADMIN"
              )
            }
            disabled={isLoading}
          >
            <SelectTrigger id="role">
              <SelectValue placeholder="انتخاب نقش" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">کاربر</SelectItem>
              <SelectItem value="ADMIN">مدیر</SelectItem>
              <SelectItem value="admin">مدیر (legacy)</SelectItem>
              <SelectItem value="moderator">ناظر</SelectItem>
              <SelectItem value="user">کاربر (legacy)</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.role && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.role.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="isActive">
            وضعیت <span className="text-destructive">*</span>
          </FieldLabel>
          <Select
            value={form.watch("isActive") ? "true" : "false"}
            onValueChange={(value) =>
              form.setValue("isActive", value === "true")
            }
            disabled={isLoading}
          >
            <SelectTrigger id="isActive">
              <SelectValue placeholder="انتخاب وضعیت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">فعال</SelectItem>
              <SelectItem value="false">غیرفعال</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.isActive && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.isActive.message}
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
