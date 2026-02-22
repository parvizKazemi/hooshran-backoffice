import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2, IconPlus, IconTrash } from "@tabler/icons-react";
import { memo, useEffect } from "react";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  useUpdateUtmContentRewardRules,
  useUtmContentRewardRules,
} from "../hooks/use-utm-analytics";

const ruleSchema = z.object({
  utmContent: z.string().trim().min(1, "utm_content الزامی است"),
  credits: z.number().int().min(0, "اعتبار نمی‌تواند منفی باشد"),
  gems: z.number().int().min(0, "gems نمی‌تواند منفی باشد"),
  subscriptionExtensionDays: z
    .number()
    .int()
    .min(0, "روز تمدید نمی‌تواند منفی باشد"),
});

const rulesFormSchema = z.object({
  rules: z.array(ruleSchema),
});

type RulesFormData = z.infer<typeof rulesFormSchema>;

export const UtmContentRewardRulesCard = memo(
  function UtmContentRewardRulesCard() {
    const { t } = useTranslation("common");
    const { data: rules, isLoading } = useUtmContentRewardRules();
    const updateRules = useUpdateUtmContentRewardRules();

    const form = useForm<RulesFormData>({
      resolver: zodResolver(rulesFormSchema),
      defaultValues: {
        rules: [],
      },
    });

    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "rules",
    });

    useEffect(() => {
      if (rules) {
        form.reset({
          rules: rules.map((rule) => ({
            utmContent: rule.utmContent ?? "",
            credits: rule.credits ?? 0,
            gems: rule.gems ?? 0,
            subscriptionExtensionDays: rule.subscriptionExtensionDays ?? 0,
          })),
        });
      }
    }, [rules, form]);

    const onSubmit: SubmitHandler<RulesFormData> = async (data) => {
      await updateRules.mutateAsync({
        rules: data.rules,
      });
    };

    const handleAddRule = () => {
      append({
        utmContent: "",
        credits: 0,
        gems: 0,
        subscriptionExtensionDays: 0,
      });
    };

    const isPending = updateRules.isPending;

    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("utmAnalytics.rewardRules.title")}</CardTitle>
          <CardDescription>
            {t("utmAnalytics.rewardRules.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddRule}
                disabled={isLoading || isPending}
              >
                <IconPlus className="mr-2 size-4" />
                {t("utmAnalytics.rewardRules.addRule")}
              </Button>
            </div>

            {fields.length === 0 ? (
              <div className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
                {t("utmAnalytics.rewardRules.empty")}
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {t("utmAnalytics.rewardRules.rule")} {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={isPending}
                      >
                        <IconTrash className="text-destructive size-4" />
                      </Button>
                    </div>

                    <FieldGroup className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                      <Field>
                        <FieldLabel>
                          {t("utmAnalytics.rewardRules.utmContent")}
                        </FieldLabel>
                        <Input
                          {...form.register(`rules.${index}.utmContent`)}
                          disabled={isPending}
                          placeholder="x"
                        />
                        {form.formState.errors.rules?.[index]?.utmContent && (
                          <FieldDescription className="text-destructive">
                            {
                              form.formState.errors.rules[index]?.utmContent
                                ?.message
                            }
                          </FieldDescription>
                        )}
                      </Field>

                      <Field>
                        <FieldLabel>
                          {t("utmAnalytics.rewardRules.credits")}
                        </FieldLabel>
                        <Input
                          type="number"
                          min="0"
                          dir="ltr"
                          className="text-left"
                          {...form.register(`rules.${index}.credits`, {
                            valueAsNumber: true,
                          })}
                          disabled={isPending}
                        />
                        {form.formState.errors.rules?.[index]?.credits && (
                          <FieldDescription className="text-destructive">
                            {
                              form.formState.errors.rules[index]?.credits
                                ?.message
                            }
                          </FieldDescription>
                        )}
                      </Field>

                      <Field>
                        <FieldLabel>
                          {t("utmAnalytics.rewardRules.gems")}
                        </FieldLabel>
                        <Input
                          type="number"
                          min="0"
                          dir="ltr"
                          className="text-left"
                          {...form.register(`rules.${index}.gems`, {
                            valueAsNumber: true,
                          })}
                          disabled={isPending}
                        />
                        {form.formState.errors.rules?.[index]?.gems && (
                          <FieldDescription className="text-destructive">
                            {form.formState.errors.rules[index]?.gems?.message}
                          </FieldDescription>
                        )}
                      </Field>

                      <Field>
                        <FieldLabel>
                          {t(
                            "utmAnalytics.rewardRules.subscriptionExtensionDays"
                          )}
                        </FieldLabel>
                        <Input
                          type="number"
                          min="0"
                          dir="ltr"
                          className="text-left"
                          {...form.register(
                            `rules.${index}.subscriptionExtensionDays`,
                            {
                              valueAsNumber: true,
                            }
                          )}
                          disabled={isPending}
                        />
                        {form.formState.errors.rules?.[index]
                          ?.subscriptionExtensionDays && (
                          <FieldDescription className="text-destructive">
                            {
                              form.formState.errors.rules[index]
                                ?.subscriptionExtensionDays?.message
                            }
                          </FieldDescription>
                        )}
                      </Field>
                    </FieldGroup>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading || isPending}>
                {isPending && (
                  <IconLoader2 className="mr-2 size-4 animate-spin" />
                )}
                {t("utmAnalytics.rewardRules.save")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }
);
