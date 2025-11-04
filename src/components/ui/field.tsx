import * as React from "react";

export function FieldGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={"grid gap-4".concat(className ?? "")} {...props} />;
}

export function Field({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={"flex flex-col gap-2".concat(className ?? "")} {...props} />
  );
}

export function FieldLabel(props: React.ComponentPropsWithoutRef<"label">) {
  return <label className="text-sm leading-none font-medium" {...props} />;
}

export function FieldDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={"text-muted-foreground text-sm".concat(className ?? "")}
      {...props}
    />
  );
}
