import { getList, type PaginatedResponse } from "@/lib/api/request";

export type MillSummaryRow = {
  id: string;
  takaSrNo: string;
  millOutvertDate?: string;
  millChallanNo?: string;
  millName?: string;
  millOutvertId?: string;
  millInvertId?: string;
  taka: {
    id: string;
  };
  millOutvert?: {
    outvertDate: string;
    firmChallanNo?: string;
  };
  millInvert?: {
    invertDate: string;
    millChallanNo?: string;
  };
};

export function getMillSummary(params?: {
  search?: string;
  mill?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  firmId?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<MillSummaryRow>> {
  return getList<MillSummaryRow>("/mill-summary", params);
}
