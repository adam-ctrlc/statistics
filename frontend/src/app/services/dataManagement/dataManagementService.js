import { useAxiosFetch } from '../hooks/useAxiosFetch';

export function useDataManagement() {
  const axiosOptions = { method: 'GET', withCredentials: true };
  const fetchStatistics = useAxiosFetch('/statistics-data', axiosOptions);
  const fetchNationalPassingRates = useAxiosFetch(
    '/national-passing-rates',
    axiosOptions
  );
  const fetchPrograms = useAxiosFetch('/programs', axiosOptions);
  const fetchDepartments = useAxiosFetch('/departments', axiosOptions);
  const fetchSchools = useAxiosFetch('/schools', axiosOptions);
  const fetchRegions = useAxiosFetch('/regions', axiosOptions);
  const fetchRoles = useAxiosFetch('/role-status', axiosOptions);
  const fetchUsers = useAxiosFetch('/users', axiosOptions);

  return {
    statistics: fetchStatistics.data,
    nationalPassingRates: fetchNationalPassingRates.data,
    programs: fetchPrograms.data,
    departments: fetchDepartments.data,
    schools: fetchSchools.data,
    regions: fetchRegions.data,
    roles: fetchRoles.data,
    users: fetchUsers.data,
    loading:
      fetchStatistics.loading ||
      fetchNationalPassingRates.loading ||
      fetchPrograms.loading ||
      fetchDepartments.loading ||
      fetchSchools.loading ||
      fetchRegions.loading ||
      fetchRoles.loading ||
      fetchUsers.loading,
    error:
      fetchStatistics.error ||
      fetchNationalPassingRates.error ||
      fetchPrograms.error ||
      fetchDepartments.error ||
      fetchSchools.error ||
      fetchRegions.error ||
      fetchRoles.error ||
      fetchUsers.error,
  };
}
