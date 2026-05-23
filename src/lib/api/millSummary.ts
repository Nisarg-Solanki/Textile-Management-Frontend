import { getList, type PaginatedResponse } from "@/lib/api/request";

export type MillSummaryProduction = {
  id: string;
  takaSrNo: string;
  takaMeter: string;
  entryDate: string;
  weight: string;
  remark?: string | null;
  productionChallanNo?: string | null;
  millOutvertId?: string | null;
  millOutvertDate?: string | null;
  millInvertId?: string | null;
  millChallanNo?: string | null;
  millName?: string | null;
  machine: {
    id: string;
    machineNo: string;
    machineType: string;
  };
  beam: {
    id: string;
    beamNo: string;
    beamMeter: string;
    beamQuality: {
      id: string;
      name: string;
    };
  };
  productionQuality: {
    id: string;
    name: string;
  };
  millOutvert?: {
    id: string;
    firmChallanNo: string;
    outvertDate: string;
  } | null;
  millInvert?: {
    id: string;
    millChallanNo: string;
    invertDate: string;
  } | null;
  taka: {
    id: string;
  };
};

export type MillSummaryRow = {
  firmChallanNo: string;
  firm: {
    id: string;
    firmName: string;
    firmCode: string;
  };
  mill: {
    id: string;
    millName: string;
    millCode: string;
  };
  millOutvertId?: string | null;
  outvertDate?: string | null;
  invertDate?: string | null;
  millChallanNo?: string | null;
  millInvertId?: string | null;
  status: string;
  takaCount: number;
  productions: MillSummaryProduction[];
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
