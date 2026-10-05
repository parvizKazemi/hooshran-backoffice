export type ModelDiscountStatusFilter = "all" | "active" | "upcoming" | "expired";

export type ModelDiscountServiceSummary = {
  uuid: string;
  name: string;
  slug: string;
  categoryName?: string;
  imageUrl?: string;
};

export type ModelDiscount = {
  uuid: string;
  apiServiceId: number;
  service?: ModelDiscountServiceSummary;
  modelName?: string | null;
  discountPercentage: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  isCurrentlyActive: boolean;
  title?: string | null;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ModelDiscountsQueryParams = {
  page?: number;
  limit?: number;
  status?: ModelDiscountStatusFilter;
  serviceUuid?: string;
  search?: string;
};

export type PaginatedModelDiscountsResponse = {
  data: ModelDiscount[];
  meta: {
    itemCount: number;
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
};

export type CreateModelDiscountInput = {
  serviceUuid: string;
  modelName?: string | null;
  discountPercentage: number;
  startsAt: string;
  endsAt: string;
  isActive?: boolean;
  title?: string;
  description?: string;
};

export type UpdateModelDiscountInput = Partial<CreateModelDiscountInput>;

export type ModelDiscountFormState = {
  serviceUuid: string;
  modelName: string;
  discountPercentage: number;
  startsDate: string;
  startsTime: string;
  endsDate: string;
  endsTime: string;
  isActive: boolean;
  title: string;
  description: string;
};
