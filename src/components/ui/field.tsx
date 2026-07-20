import { cn } from "@/lib/utils";
import * as React from "react";

export function FieldGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("grid gap-4", className)} {...props} />;
}

export function Field({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />;
}

export function FieldLabel(props: React.ComponentPropsWithoutRef<"label">) {
  return <label className="text-sm leading-none font-medium" {...props} />;
}

export function FieldDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-muted-foreground text-sm", className)} {...props} />
  );
}
