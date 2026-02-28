"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/app/lib/api";

export function useAuth() {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      return fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return fetchApi("/auth/logout", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });

  const verifyPasswordMutation = useMutation({
    mutationFn: async (passwordData) => {
      return fetchApi("/auth/verify-password", {
        method: "POST",
        body: JSON.stringify(passwordData),
      });
    },
  });

  return {
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    verifyPassword: verifyPasswordMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isVerifyingPassword: verifyPasswordMutation.isPending,
    loginError: loginMutation.error,
    logoutError: logoutMutation.error,
    verifyPasswordError: verifyPasswordMutation.error,
    loginSuccess: loginMutation.isSuccess,
    logoutSuccess: logoutMutation.isSuccess,
    verifyPasswordSuccess: verifyPasswordMutation.isSuccess,
  };
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchApi("/auth/profile"),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserStatus(id) {
  return useQuery({
    queryKey: ["userStatus", id],
    queryFn: () => fetchApi(`/auth/status/${id}`),
    enabled: !!id,
  });
}
