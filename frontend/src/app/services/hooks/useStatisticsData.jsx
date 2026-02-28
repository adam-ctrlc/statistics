"use client";

import {
  useQueryFetch,
  useMutationFetch,
} from "@/app/services/hooks/useQueryFetch";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/app/lib/api";

export function useStatisticsData(filters = {}) {
  return useQuery({
    queryKey: ["statisticsData", filters],
    queryFn: () => {
      const params = new URLSearchParams();

      // Handle array filters properly
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            if (item !== undefined && item !== null && item !== "") {
              params.append(key, item);
            }
          });
        } else if (value !== undefined && value !== null && value !== "") {
          params.append(key, value);
        }
      });

      const queryString = params.toString();
      const url = queryString
        ? `/statistics-data?${queryString}`
        : "/statistics-data";
      console.log("Statistics API URL:", url);
      return fetchApi(url);
    },
    enabled: true,
  });
}

export function useStatisticsYears() {
  return useQuery({
    queryKey: ["statisticsYears"],
    queryFn: async () => {
      const response = await fetchApi("/statistics-data/years");
      return Array.isArray(response?.years) ? response.years : [];
    },
  });
}

export function useStatisticsFilter(filterData) {
  return useQuery({
    queryKey: ["statisticsFilter", filterData],
    queryFn: () =>
      fetchApi("/statistics-data/filter", {
        method: "POST",
        body: JSON.stringify(filterData),
      }),
    enabled: !!filterData && Object.keys(filterData).length > 0,
  });
}

export function useStatisticsDataMutations() {
  const createStatistics = useMutationFetch({
    invalidateKeys: ["statisticsData", "statisticsYears"],
  });

  const updateStatistics = useMutationFetch({
    invalidateKeys: ["statisticsData", "statisticsYears"],
  });

  const deleteStatistics = useMutationFetch({
    invalidateKeys: ["statisticsData", "statisticsYears"],
  });

  const bulkDeleteStatistics = useMutationFetch({
    invalidateKeys: ["statisticsData", "statisticsYears"],
  });

  const importStatistics = useMutationFetch({
    invalidateKeys: ["statisticsData", "statisticsYears"],
  });

  const exportStatistics = useMutationFetch();

  return {
    createStatistics: (data) =>
      createStatistics.mutate({ url: "/statistics-data", data }),
    updateStatistics: (id, data) =>
      updateStatistics.mutate({
        url: `/statistics-data/${id}`,
        method: "PUT",
        data,
      }),
    deleteStatistics: (id) =>
      deleteStatistics.mutate({
        url: `/statistics-data/${id}`,
        method: "DELETE",
      }),
    bulkDeleteStatistics: (ids) =>
      bulkDeleteStatistics.mutate({
        url: "/statistics-data/bulk-delete",
        data: { ids },
      }),
    importStatistics: (formData) =>
      importStatistics.mutate({
        url: "/statistics-data/import",
        data: formData,
      }),
    exportStatistics: async (data) =>
      exportStatistics.mutateAsync({ url: "/statistics-data/export", data }),
    fetchRecordById: async (id) => {
      try {
        const response = await fetchApi(`/statistics-data/${id}`);
        return { data: response, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },
    isCreating: createStatistics.isPending,
    isUpdating: updateStatistics.isPending,
    isDeleting: deleteStatistics.isPending,
    isBulkDeleting: bulkDeleteStatistics.isPending,
    isImporting: importStatistics.isPending,
    isExporting: exportStatistics.isPending,
  };
}
