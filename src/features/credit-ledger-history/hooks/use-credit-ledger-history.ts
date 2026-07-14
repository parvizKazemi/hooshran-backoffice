import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/services/api";
import { fetchCreditLedgerByPhone } from "../api/service";
import { CREDIT_LEDGER_QUERY_KEY } from "../constants";
import type {
  CreditLedgerApiResponse,
  CreditLedgerQueryParams,
} from "../types";

const EMPTY_RESPONSE: CreditLedgerApiResponse = {
  data: [],
  meta: {
    total: 0,
    page: 1,
    limit: 25,
    pages: 0,
  },
};

export const useCreditLedgerHistory = (
  params: CreditLedgerQueryParams = {}
) => {
  return useQuery({
    queryKey: [CREDIT_LEDGER_QUERY_KEY, params],
    queryFn: async (): Promise<CreditLedgerApiResponse> => {
      try {
        if (!params.phoneNumber) {
          return EMPTY_RESPONSE;
        }

        return await fetchCreditLedgerByPhone(params);
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
    },
    enabled: !!params.phoneNumber,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
