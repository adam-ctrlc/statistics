"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/app/lib/api";

export function useFetch(url, options = {}) {
  const query = useQuery({
    queryKey: [url, options],
    queryFn: () => fetchApi(url, options),
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error?.message || query.error,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
  };
}
