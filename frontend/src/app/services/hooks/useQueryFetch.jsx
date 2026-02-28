"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/app/lib/api";

export function useQueryFetch(key, url, options = {}) {
  return useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: () => fetchApi(url),
    ...options,
  });
}

export function useMutationFetch(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ url, method = "POST", data }) => {
      return fetchApi(url, {
        method,
        body: data ? JSON.stringify(data) : undefined,
      });
    },
    onSuccess: (data, variables) => {
      if (options.invalidateKeys) {
        options.invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({
            queryKey: Array.isArray(key) ? key : [key],
          });
        });
      }
    },
    ...options,
  });
}

export function useAuthQuery() {
  const mutation = useMutationFetch();

  const login = (credentials) => {
    return mutation.mutate({
      url: "/auth/login",
      method: "POST",
      data: credentials,
    });
  };

  const logout = () => {
    return mutation.mutate({
      url: "/auth/logout",
      method: "POST",
    });
  };

  return {
    login,
    logout,
    isPending: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

export function useProfileQuery() {
  return useQueryFetch("profile", "/auth/profile");
}
