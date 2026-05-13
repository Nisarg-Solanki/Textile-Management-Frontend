import axios from "axios";
import { toast } from "sonner";

export class ApiError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err) && err.response) {
    const { message, code } = err.response.data as {
      message: string;
      code: string;
    };
    return new ApiError(
      message ?? "Something went wrong",
      code ?? "UNKNOWN",
      err.response.status,
    );
  }
  return new ApiError(
    "Network error. Please check your connection.",
    "NETWORK_ERROR",
    0,
  );
}

export function showErrorToast(err: unknown): void {
  const message =
    err instanceof ApiError
      ? err.message
      : "Something went wrong. Please try again.";
  toast.error(message);
}
