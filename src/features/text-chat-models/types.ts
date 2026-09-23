export interface TextChatModel {
  name: string;
  code: string;
  priceRatio: number;
  isActive: boolean;
  maxToken?: number;
  inputToken?: number;
  outputToken?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TextChatModelFormValues {
  code: string;
  name: string;
  priceRatio: string;
  isActive: boolean;
  maxToken: string;
  inputToken: string;
  outputToken: string;
}

export interface CreateTextChatModelPayload {
  code: string;
  name?: string;
  priceRatio: number;
  isActive?: boolean;
  maxToken?: number;
  inputToken?: number;
  outputToken?: number;
}

export type UpdateTextChatModelPayload = Partial<
  Omit<CreateTextChatModelPayload, "code">
>;

export type TextChatModelStatusFilter = "all" | "active" | "inactive";
