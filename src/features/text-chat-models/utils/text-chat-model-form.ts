import { TEXT_CHAT_MODEL_CODE_PATTERN } from "../constants";
import type {
  CreateTextChatModelPayload,
  TextChatModel,
  TextChatModelFormValues,
  UpdateTextChatModelPayload,
} from "../types";

export const EMPTY_TEXT_CHAT_MODEL_FORM: TextChatModelFormValues = {
  code: "",
  name: "",
  priceRatio: "",
  isActive: true,
  maxToken: "",
  inputToken: "",
  outputToken: "",
};

export function modelToFormValues(model: TextChatModel): TextChatModelFormValues {
  return {
    code: model.code,
    name: model.name === model.code ? "" : model.name,
    priceRatio: String(model.priceRatio),
    isActive: model.isActive,
    maxToken: model.maxToken ? String(model.maxToken) : "",
    inputToken: model.inputToken ? String(model.inputToken) : "",
    outputToken: model.outputToken ? String(model.outputToken) : "",
  };
}

export type TextChatModelFormErrorKey =
  | "code"
  | "priceRatio"
  | "token"
  | "outputOverMax"
  | "inputOverMax";

export function validateTextChatModelForm(
  values: TextChatModelFormValues,
  mode: "create" | "edit"
): TextChatModelFormErrorKey | null {
  const code = values.code.trim();
  if (mode === "create" && !TEXT_CHAT_MODEL_CODE_PATTERN.test(code)) return "code";

  const priceRatio = Number(values.priceRatio);
  if (!values.priceRatio.trim() || !Number.isFinite(priceRatio) || priceRatio < 0) {
    return "priceRatio";
  }

  const tokens = {
    maxToken: parseOptionalToken(values.maxToken),
    inputToken: parseOptionalToken(values.inputToken),
    outputToken: parseOptionalToken(values.outputToken),
  };
  if (
    tokens.maxToken === "invalid" ||
    tokens.inputToken === "invalid" ||
    tokens.outputToken === "invalid"
  ) {
    return "token";
  }

  if (
    typeof tokens.maxToken === "number" &&
    typeof tokens.outputToken === "number" &&
    tokens.outputToken > tokens.maxToken
  ) {
    return "outputOverMax";
  }
  if (
    typeof tokens.maxToken === "number" &&
    typeof tokens.inputToken === "number" &&
    tokens.inputToken > tokens.maxToken
  ) {
    return "inputOverMax";
  }

  return null;
}

export function toCreatePayload(values: TextChatModelFormValues): CreateTextChatModelPayload {
  const name = values.name.trim();
  return {
    code: values.code.trim(),
    ...(name ? { name } : {}),
    priceRatio: Number(values.priceRatio),
    isActive: values.isActive,
    ...optionalTokens(values),
  };
}

export function toUpdatePayload(values: TextChatModelFormValues): UpdateTextChatModelPayload {
  const name = values.name.trim();
  return {
    ...(name ? { name } : {}),
    priceRatio: Number(values.priceRatio),
    isActive: values.isActive,
    ...optionalTokens(values),
  };
}

function optionalTokens(values: TextChatModelFormValues) {
  const maxToken = parseOptionalToken(values.maxToken);
  const inputToken = parseOptionalToken(values.inputToken);
  const outputToken = parseOptionalToken(values.outputToken);
  return {
    ...(typeof maxToken === "number" ? { maxToken } : {}),
    ...(typeof inputToken === "number" ? { inputToken } : {}),
    ...(typeof outputToken === "number" ? { outputToken } : {}),
  };
}

function parseOptionalToken(raw: string): number | "invalid" | undefined {
  const value = raw.trim();
  if (!value) return undefined;
  if (!/^\d+$/.test(value)) return "invalid";
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return "invalid";
  return parsed;
}

export function filterTextChatModels(
  models: TextChatModel[],
  query: string,
  status: "all" | "active" | "inactive"
): TextChatModel[] {
  const normalized = query.trim().toLowerCase();
  return models
    .filter((model) => {
      if (status === "active" && !model.isActive) return false;
      if (status === "inactive" && model.isActive) return false;
      if (!normalized) return true;
      return (
        model.name.toLowerCase().includes(normalized) ||
        model.code.toLowerCase().includes(normalized)
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name, "fa"));
}
