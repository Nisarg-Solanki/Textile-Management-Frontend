import { useInfiniteQuery } from "@tanstack/react-query";
import type { PaginatedResponse } from "@/lib/api/request";

type Params = Record<string, string | number | boolean | undefined>;

type Options<T, P extends Params> = {
  queryKey: readonly unknown[];
  params: P;
  limit?: number;
  fetcher: (params: P & { page: number; limit: number }) => Promise<PaginatedResponse<T>>;
  enabled?: boolean;
};

export function useInfiniteList<T, P extends Params>({
  queryKey,
  params,
  limit = 20,
  fetcher,
  enabled,
}: Options<T, P>) {
  const query = useInfiniteQuery({
    queryKey: [...queryKey, { ...params, limit }],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetcher({ ...params, page: pageParam as number, limit }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled,
  });

  const items = (query.data?.pages.flatMap((p) => p.data) ?? []) as T[];
  const totalCount = query.data?.pages[0]?.pagination.total;

  return {
    items,
    totalCount,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: !!query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
}
