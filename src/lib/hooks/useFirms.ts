import { useQuery } from "@tanstack/react-query";
import { getFirms } from "@/lib/api/firms";

export function useFirms() {
  const { data, isLoading } = useQuery({
    queryKey: ["firms-all"],
    queryFn: () => getFirms({ limit: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  const firms = data?.data ?? [];

  return {
    firms,
    isLoading,
    firmOptions: firms.map((f) => ({ value: f.id, label: f.firmName })),
  };
}
