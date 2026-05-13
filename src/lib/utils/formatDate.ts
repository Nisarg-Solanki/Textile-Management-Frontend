import { format } from "date-fns";

export function formatDate(value: Date | string): string {
  return format(new Date(value), "dd/MM/yyyy");
}

export function formatDateTime(value: Date | string): string {
  return format(new Date(value), "dd/MM/yyyy HH:mm");
}
