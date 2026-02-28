"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/app/lib/api";

export function useDashboardData() {
  const statistics = useQuery({
    queryKey: ["statistics"],
    queryFn: () => fetchApi("/statistics-data"),
  });

  const nationalRates = useQuery({
    queryKey: ["nationalRates"],
    queryFn: () => fetchApi("/national-passing-rates"),
  });

  const userProfile = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchApi("/auth/profile"),
  });

  return {
    statistics: statistics.data?.data || [],
    statisticsSummary: statistics.data?.summary || {},
    statisticsLoading: statistics.isLoading,
    statisticsError: statistics.error,
    nationalRates: nationalRates.data,
    nationalRatesLoading: nationalRates.isLoading,
    nationalRatesError: nationalRates.error,
    userProfile: userProfile.data,
    userProfileLoading: userProfile.isLoading,
    userProfileError: userProfile.error,
  };
}

export function useStatistics() {
  return useQuery({
    queryKey: ["statistics"],
    queryFn: () => fetchApi("/statistics-data"),
  });
}

export function useNationalRates() {
  return useQuery({
    queryKey: ["nationalRates"],
    queryFn: () => fetchApi("/national-passing-rates"),
  });
}
