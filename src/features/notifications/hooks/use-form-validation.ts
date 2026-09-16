import { getRequiredFields, type FormData } from "../config/field-config";

export function useFormValidation(templateType: string) {
  const validateRequiredFields = (data: Record<string, unknown>): string[] => {
    const requiredFields = getRequiredFields(templateType, data as FormData);
    const errors: string[] = [];

    requiredFields.forEach((fieldName) => {
      const value = getNestedValue(data, fieldName);
      if (
        !value ||
        (typeof value === "string" && value.trim() === "") ||
        (Array.isArray(value) && value.length === 0)
      ) {
        errors.push(fieldName);
      }
    });

    return errors;
  };

  return {
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
