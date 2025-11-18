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
import { useCreateUser, useUpdateUser } from "../hooks/use-users";
import {
  CreateUserInput,
  createUserSchema,
  UpdateUserInput,
  updateUserSchema,
  User,
} from "../types";

type UserFormProps = {
  user?: User;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const isEditing = !!user;
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  // Create form
  const createForm = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      phoneNumber: "",
      role: "USER",
      registrationSource: "",
    },
  });

  // Update form
  const updateForm = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: user
      ? {
          uuid: user.uuid,
          phoneNumber: user.phoneNumber || "",
          role: user.role || "USER",
          isActive: user.isActive ?? true,
          registrationSource: user.registrationSource || "",
        }
      : {
          uuid: "",
          phoneNumber: "",
          role: "USER",
          isActive: true,
          registrationSource: "",
        },
  });

  const onCreateSubmit = async (data: CreateUserInput) => {
    // Build payload according to API DTO: phoneNumber (required), role (optional), registrationSource (optional)
    const payload: Record<string, unknown> = {
      phoneNumber: data.phoneNumber,
    };
    // Only include role if it's explicitly set (default is "USER" on server)
    if (data.role) {
      payload.role = data.role;
    }
    // Only include registrationSource if it's not empty
    if (data.registrationSource && data.registrationSource.trim() !== "") {
      payload.registrationSource = data.registrationSource.trim();
    }
    await createUser.mutateAsync(payload as CreateUserInput);
    onSuccess?.();
    createForm.reset();
  };

  const onUpdateSubmit = async (data: UpdateUserInput) => {
    await updateUser.mutateAsync(data);
    onSuccess?.();
  };

  const isLoading = createUser.isPending || updateUser.isPending;

  // Render create form
  if (!isEditing) {
    return (
      <form
        onSubmit={createForm.handleSubmit(onCreateSubmit)}
        className="space-y-6"
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="phoneNumber">
              شماره تماس <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="phoneNumber"
              {...createForm.register("phoneNumber")}
              placeholder="09123456789"
              disabled={isLoading}
              required
            />
            {createForm.formState.errors.phoneNumber && (
              <FieldDescription className="text-destructive">
                {createForm.formState.errors.phoneNumber.message}
              </FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="role">نقش</FieldLabel>
            <Select
              value={createForm.watch("role") || "USER"}
              onValueChange={(value) =>
                createForm.setValue("role", value as "USER" | "ADMIN")
              }
              disabled={isLoading}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="انتخاب نقش (پیش‌فرض: کاربر)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">کاربر</SelectItem>
                <SelectItem value="ADMIN">مدیر</SelectItem>
              </SelectContent>
            </Select>
            {createForm.formState.errors.role && (
              <FieldDescription className="text-destructive">
                {createForm.formState.errors.role.message}
              </FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="registrationSource">منبع ثبت‌نام</FieldLabel>
            <Input
              id="registrationSource"
              {...createForm.register("registrationSource")}
              placeholder="web-app, mobile-app, admin-panel, etc."
              disabled={isLoading}
            />
            {createForm.formState.errors.registrationSource && (
              <FieldDescription className="text-destructive">
                {createForm.formState.errors.registrationSource.message}
              </FieldDescription>
            )}
          </Field>
        </FieldGroup>

        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading && <IconLoader2 className="mr-2 size-4 animate-spin" />}
            ایجاد کاربر
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

  // Render update form
  return (
    <form
      onSubmit={updateForm.handleSubmit(onUpdateSubmit)}
      className="space-y-6"
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="phoneNumber">شماره تماس</FieldLabel>
          <Input
            id="phoneNumber"
            {...updateForm.register("phoneNumber")}
            placeholder="+989392285590"
            disabled={isLoading}
          />
          {updateForm.formState.errors.phoneNumber && (
            <FieldDescription className="text-destructive">
              {updateForm.formState.errors.phoneNumber.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="registrationSource">منبع ثبت‌نام</FieldLabel>
          <Input
            id="registrationSource"
            {...updateForm.register("registrationSource")}
            placeholder="web, mobile, etc."
            disabled={isLoading}
          />
          {updateForm.formState.errors.registrationSource && (
            <FieldDescription className="text-destructive">
              {updateForm.formState.errors.registrationSource.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="role">نقش</FieldLabel>
          <Select
            value={updateForm.watch("role") || "USER"}
            onValueChange={(value) =>
              updateForm.setValue("role", value as "USER" | "ADMIN")
            }
            disabled={isLoading}
          >
            <SelectTrigger id="role">
              <SelectValue placeholder="انتخاب نقش" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">کاربر</SelectItem>
              <SelectItem value="ADMIN">مدیر</SelectItem>
            </SelectContent>
          </Select>
          {updateForm.formState.errors.role && (
            <FieldDescription className="text-destructive">
              {updateForm.formState.errors.role.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="isActive">وضعیت</FieldLabel>
          <Select
            value={updateForm.watch("isActive") ? "true" : "false"}
            onValueChange={(value) =>
              updateForm.setValue("isActive", value === "true")
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
          {updateForm.formState.errors.isActive && (
            <FieldDescription className="text-destructive">
              {updateForm.formState.errors.isActive.message}
            </FieldDescription>
          )}
        </Field>
      </FieldGroup>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading && <IconLoader2 className="mr-2 size-4 animate-spin" />}
          ذخیره تغییرات
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
