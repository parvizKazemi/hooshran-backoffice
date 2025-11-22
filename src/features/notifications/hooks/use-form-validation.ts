import { useMemo } from "react";
import { getRequiredFields } from "../config/field-config";

export function useFormValidation(templateType: string) {
  const requiredFields = useMemo(
    () => getRequiredFields(templateType),
    [templateType]
  );

  const validateRequiredFields = (data: Record<string, unknown>): string[] => {
    const errors: string[] = [];

    requiredFields.forEach((fieldName) => {
      // Handle nested fields like "metaData.data.title"
      const value = getNestedValue(data, fieldName);
      if (!value || (typeof value === "string" && value.trim() === "")) {
        errors.push(fieldName);
      }
    });

    return errors;
  };

  return {
    requiredFields,
    validateRequiredFields,
  };
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce((current: unknown, key: string) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}
