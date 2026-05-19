type SettingsPageHeaderProps = {
  title: string;
  description: string;
};

export function SettingsPageHeader({
  title,
  description,
}: SettingsPageHeaderProps) {
  return (
    <div className="mb-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground mt-3 text-sm">{description}</p>
    </div>
  );
}
