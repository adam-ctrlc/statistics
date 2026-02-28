"use client";

import { useQueryFetch, useMutationFetch } from "@/app/services/hooks/useQueryFetch";

export function useDepartments() {
  return useQueryFetch("departments", "/departments");
}

export function useDepartmentMutations() {
  const createDepartment = useMutationFetch({
    invalidateKeys: ["departments"],
  });

  const updateDepartment = useMutationFetch({
    invalidateKeys: ["departments"],
  });

  const deleteDepartment = useMutationFetch({
    invalidateKeys: ["departments"],
  });

  return {
    createDepartment: (data) =>
      createDepartment.mutate({ url: "/departments", data }),
    updateDepartment: (id, data) =>
      updateDepartment.mutate({
        url: `/departments/${id}`,
        method: "PUT",
        data,
      }),
    deleteDepartment: (id) =>
      deleteDepartment.mutate({ url: `/departments/${id}`, method: "DELETE" }),
    isCreating: createDepartment.isPending,
    isUpdating: updateDepartment.isPending,
    isDeleting: deleteDepartment.isPending,
  };
}

export function usePrograms() {
  return useQueryFetch("programs", "/programs");
}

export function useProgramMutations() {
  const createProgram = useMutationFetch({
    invalidateKeys: ["programs"],
  });

  const updateProgram = useMutationFetch({
    invalidateKeys: ["programs"],
  });

  const deleteProgram = useMutationFetch({
    invalidateKeys: ["programs"],
  });

  return {
    createProgram: (data) => createProgram.mutate({ url: "/programs", data }),
    updateProgram: (id, data) =>
      updateProgram.mutate({ url: `/programs/${id}`, method: "PUT", data }),
    deleteProgram: (id) =>
      deleteProgram.mutate({ url: `/programs/${id}`, method: "DELETE" }),
    isCreating: createProgram.isPending,
    isUpdating: updateProgram.isPending,
    isDeleting: deleteProgram.isPending,
  };
}

export function useRegions() {
  return useQueryFetch("regions", "/regions");
}

export function useRegionMutations() {
  const createRegion = useMutationFetch({
    invalidateKeys: ["regions"],
  });

  const updateRegion = useMutationFetch({
    invalidateKeys: ["regions"],
  });

  const deleteRegion = useMutationFetch({
    invalidateKeys: ["regions"],
  });

  return {
    createRegion: (data) => createRegion.mutate({ url: "/regions", data }),
    updateRegion: (id, data) =>
      updateRegion.mutate({ url: `/regions/${id}`, method: "PUT", data }),
    deleteRegion: (id) =>
      deleteRegion.mutate({ url: `/regions/${id}`, method: "DELETE" }),
    isCreating: createRegion.isPending,
    isUpdating: updateRegion.isPending,
    isDeleting: deleteRegion.isPending,
  };
}

export function useSchools() {
  return useQueryFetch("schools", "/schools");
}

export function useSchoolMutations() {
  const createSchool = useMutationFetch({
    invalidateKeys: ["schools"],
  });

  const updateSchool = useMutationFetch({
    invalidateKeys: ["schools"],
  });

  const deleteSchool = useMutationFetch({
    invalidateKeys: ["schools"],
  });

  return {
    createSchool: (data) => createSchool.mutate({ url: "/schools", data }),
    updateSchool: (id, data) =>
      updateSchool.mutate({ url: `/schools/${id}`, method: "PUT", data }),
    deleteSchool: (id) =>
      deleteSchool.mutate({ url: `/schools/${id}`, method: "DELETE" }),
    isCreating: createSchool.isPending,
    isUpdating: updateSchool.isPending,
    isDeleting: deleteSchool.isPending,
  };
}

export function useUsers() {
  return useQueryFetch("users", "/users");
}

export function useUserMutations() {
  const createUser = useMutationFetch({
    invalidateKeys: ["users"],
  });

  const updateUser = useMutationFetch({
    invalidateKeys: ["users"],
  });

  const deleteUser = useMutationFetch({
    invalidateKeys: ["users"],
  });

  const updateUserPassword = useMutationFetch({
    invalidateKeys: ["users"],
  });

  return {
    createUser: (data) => createUser.mutate({ url: "/users", data }),
    updateUser: (id, data) =>
      updateUser.mutate({ url: `/users/${id}`, method: "PUT", data }),
    deleteUser: (id) =>
      deleteUser.mutate({ url: `/users/${id}`, method: "DELETE" }),
    updateUserPassword: (id, data) =>
      updateUserPassword.mutate({
        url: `/users/${id}/password`,
        method: "PUT",
        data,
      }),
    isCreating: createUser.isPending,
    isUpdating: updateUser.isPending,
    isDeleting: deleteUser.isPending,
    isUpdatingPassword: updateUserPassword.isPending,
  };
}
