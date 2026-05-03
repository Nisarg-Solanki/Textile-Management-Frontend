"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type UseQueryParamsReturn = {
  get: (key: string) => string | null;
  set: (key: string, value: string) => void;
  remove: (key: string) => void;
  getAll: () => Record<string, string>;
};

export function useQueryParams(): UseQueryParamsReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  const get = useCallback(
    (key: string): string | null => searchParams.get(key),
    [searchParams],
  );

  const set = useCallback(
    (key: string, value: string): void => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const remove = useCallback(
    (key: string): void => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const getAll = useCallback((): Record<string, string> => {
    const result: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }, [searchParams]);

  return { get, set, remove, getAll };
}
