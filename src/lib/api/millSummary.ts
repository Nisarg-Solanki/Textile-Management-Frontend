import { getList, type PaginatedResponse } from "@/lib/api/request";

export type MillSummaryRow = {
  takaSrNo: string;
  beamNo: string;
  firmId: string;
  firmName: string;
  millOutvertId?: string;
  outvertDate?: string;
  millName?: string;
  millInvertId?: string;
  invertDate?: string;
  millChallanNo?: string;
  status: "not_sent" | "at_mill" | "returned";
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
