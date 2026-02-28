"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/app/lib/api";

export function useAxiosFetch(url, options = {}) {
  const cacheKey = [url, options];

  const query = useQuery({
    queryKey: cacheKey,
    queryFn: () => fetchApi(url, options),
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error?.message || query.error,
    firstLoad: query.isLoading && !query.data,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
  };
}
