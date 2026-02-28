'use client';
import React, { useState, useEffect } from 'react';
import SchoolFormModal from '../components/SchoolFormModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import CustomSelect from '@/app/components/CustomSelect';
import { schoolService } from '../../../services/dataManagement/schoolService';
import { regionService } from '../../../services/dataManagement/regionService';
import AlertMessage from '@/app/(login)/profile/components/AlertMessage';
import LoadingIndicator from '@/app/(login)/profile/components/LoadingIndicator';
import { userService } from '../../../services/dataManagement/userService';
import { statisticsService } from '../../../services/dataManagement/statisticsService';
import { Edit, Trash2 } from '@/app/components/icons';

export default function SchoolsManagement() {
  // State for data management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schools, setSchools] = useState([]);
  const [regions, setRegions] = useState([]);
  const [users, setUsers] = useState([]);
  const [statistics, setStatistics] = useState([]);

  // Modal states
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [phinmaFilter, setPhinmaFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Stats
  const [schoolStats, setSchoolStats] = useState({
    total: 0,
    phinma: 0,
    nonPhinma: 0,
    byRegion: {},
  });

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
    fetchUsers();
    fetchStatistics();
  }, []);

  // Fetch schools and regions from backend
  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [schoolsRes, regionsRes] = await Promise.all([
        schoolService.getAll(),
        regionService.getAll(),
      ]);
      if (schoolsRes.error) throw schoolsRes.error;
      if (regionsRes.error) throw regionsRes.error;
      const schoolData = schoolsRes.data || [];
      const regionData = regionsRes.data || [];
      setSchools(schoolData);
      setRegions(regionData);
      // Calculate stats
      const totalSchools = schoolData.length;
      const phinmaSchools = schoolData.filter((s) => s.is_phinma).length;
      const nonPhinmaSchools = schoolData.filter((s) => !s.is_phinma).length;
      const byRegion = {};
      regionData.forEach((region) => {
        byRegion[region._id || region.id] = {
          name: region.name,
          count: schoolData.filter(
            (s) =>
              (s.region_id?._id || s.region_id?.id || s.region_id) ===
              (region._id || region.id)
          ).length,
        };
      });
      setSchoolStats({
        total: totalSchools,
        phinma: phinmaSchools,
        nonPhinma: nonPhinmaSchools,
        byRegion,
      });
    } catch (err) {
      setError(err.message || 'Failed to load schools or regions');
      setSchools([]);
      setRegions([]);
      setSchoolStats({ total: 0, phinma: 0, nonPhinma: 0, byRegion: {} });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await userService.getAll();
      setUsers(data || []);
    } catch {}
  };

  const fetchStatistics = async () => {
    try {
      const { data } = await statisticsService.getAll();
      setStatistics(Array.isArray(data) ? data : []);
    } catch {}
  };

  // Function to handle opening school modal for creating a new school
  const handleAddSchool = () => {
    setSelectedSchool(null);
    setIsEditing(false);
    setIsSchoolModalOpen(true);
  };

  // Function to handle school edit
  const handleEdit = async (school) => {
    setIsEditing(true);
    setSelectedSchool(null); // Clear previous selection while loading
    try {
      const { data, error } = await schoolService.getById(
        school._id || school.id
      );
      if (error) throw error;
      setSelectedSchool(data);
      setIsSchoolModalOpen(true);
    } catch (err) {
      setError(err.message || 'Failed to fetch school data');
      setIsEditing(false);
    }
  };

  // Function to handle delete confirmation
  const handleDeleteConfirmation = (school) => {
    setSelectedSchool(school);
    setIsDeleteModalOpen(true);
  };

  // Function to handle school deletion
  const handleDeleteSchool = async () => {
    if (!selectedSchool) return;
    setIsLoading(true);
    setError(null);
    try {
      await schoolService.delete(selectedSchool._id || selectedSchool.id);
      setSchools((prev) =>
        prev.filter(
          (s) => (s._id || s.id) !== (selectedSchool._id || selectedSchool.id)
        )
      );
      setIsDeleteModalOpen(false);
      setSelectedSchool(null);
      fetchAllData();
    } catch (err) {
      setError(err.message || 'Failed to delete school');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle form submission from modal
  const handleSchoolFormSubmit = async (schoolData) => {
    setError(null);
    try {
      if (isEditing && selectedSchool) {
        const updatedSchool = await schoolService.update(
          selectedSchool._id || selectedSchool.id,
          schoolData
        );
        setSchools((prev) =>
          prev.map((s) => (s._id === updatedSchool._id ? updatedSchool : s))
        );
      } else {
        const newSchool = await schoolService.create(schoolData);
        setSchools((prev) => [...prev, newSchool]);
      }
      setIsSchoolModalOpen(false);
      setSelectedSchool(null);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to save school');
    }
  };

  // Function to filter schools based on search and filters
  const filteredSchools = schools.filter((school) => {
    // Apply search term filter
    const searchMatch =
      searchTerm === '' ||
      school.school.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply region filter
    const regionMatch =
      regionFilter === '' || school.region_id.toString() === regionFilter;

    // Apply PHINMA filter
    const phinmaMatch =
      phinmaFilter === '' ||
      (phinmaFilter === 'phinma' && school.is_phinma) ||
      (phinmaFilter === 'nonphinma' && !school.is_phinma);

    return searchMatch && regionMatch && phinmaMatch;
  });

  // Calculate pagination
  const indexOfLastSchool = currentPage * itemsPerPage;
  const indexOfFirstSchool = indexOfLastSchool - itemsPerPage;
  const currentSchools = filteredSchools.slice(
    indexOfFirstSchool,
    indexOfLastSchool
  );
  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);

  // Function to clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setRegionFilter('');
    setPhinmaFilter('');
    setCurrentPage(1);
  };

  // Function to get region name by id
  const getRegionName = (regionId) => {
    const region = regions.find(
      (region) =>
        (region._id || region.id) ===
        (regionId?._id || regionId?.id || regionId)
    );
    return region ? region.name : 'Unknown';
  };

  // Helper to check if a school is in use
  const isSchoolInUse = (schoolId) => {
    return (
      (Array.isArray(users) &&
        users.some(
          (u) =>
            (u.school_id?._id || u.school_id?.id || u.school_id) ===
            (schoolId._id || schoolId.id)
        )) ||
      (Array.isArray(statistics) &&
        statistics.some(
          (s) =>
            (s.school_id?._id || s.school_id?.id || s.school_id) ===
            (schoolId._id || schoolId.id)
        ))
    );
  };

  return (
    <div className='schools-management'>
      {/* Error Alert */}
      {error && <AlertMessage message={error} type='error' />}
      {/* Loading indicator */}
      {isLoading && <LoadingIndicator />}
      {!isLoading && !error && (
        <>
          {/* Statistics Layout */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
            {/* School Statistics */}
            <div className='border border-gray-100 rounded-xl p-6 bg-gradient-to-br from-white to-indigo-50'>
              <h2 className='text-xl font-semibold text-red-800 mb-5'>
                School Statistics
              </h2>

              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Total Schools</span>
                  <span className='font-medium text-gray-900 text-lg'>
                    {schoolStats.total}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>PHINMA Schools</span>
                  <span className='font-medium text-gray-900 text-lg'>
                    {schoolStats.phinma}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Non-PHINMA Schools</span>
                  <span className='font-medium text-gray-900 text-lg'>
                    {schoolStats.nonPhinma}
                  </span>
                </div>
              </div>
            </div>

            {/* Schools by Region */}
            <div className='border border-gray-100 rounded-xl p-6 bg-gradient-to-br from-white to-green-50'>
              <h2 className='text-xl font-semibold text-red-800 mb-5'>
                Schools by Region
              </h2>

              <div className='space-y-4 max-h-52 overflow-y-auto'>
                {Object.keys(schoolStats.byRegion).map((regionId) => {
                  const region = schoolStats.byRegion[regionId];
                  return (
                    <div
                      className='flex justify-between items-center'
                      key={regionId}
                    >
                      <span className='text-gray-600 truncate pr-2'>
                        {region.name}
                      </span>
                      <span className='font-medium text-gray-900'>
                        {region.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Add School Button */}
          <div className='mb-6'>
            <button
              onClick={handleAddSchool}
              className='bg-red-700 hover:bg-red-800 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 mr-2'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              Add New School
            </button>
          </div>

          {/* Search and Filter */}
          <div className='bg-white border border-gray-100 rounded-xl p-6 mb-8'>
            <div className='relative mb-6'>
              <input
                id='schools-search'
                name='schools-search'
                aria-label='Search schools'
                type='text'
                autoComplete='off'
                className='w-full border border-gray-200 p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent'
                placeholder='Search schools...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 text-gray-400'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1.5}
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div>
                <CustomSelect
                  id='region-filter'
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  options={[
                    { value: '', label: 'All Regions' },
                    ...(regions || []).map((region) => {
                      const regionId = region._id || region.id;
                      return {
                        value: regionId ? regionId.toString() : '',
                        label: region.name || 'Unknown',
                      };
                    }),
                  ]}
                  placeholder='All Regions'
                  className=''
                />
              </div>
              <div>
                <CustomSelect
                  id='phinma-filter'
                  value={phinmaFilter}
                  onChange={(e) => setPhinmaFilter(e.target.value)}
                  options={[
                    { value: '', label: 'All Schools' },
                    { value: 'phinma', label: 'PHINMA Schools' },
                    { value: 'nonphinma', label: 'Non-PHINMA Schools' },
                  ]}
                  placeholder='All Schools'
                  className=''
                />
              </div>
            </div>

            <div className='mt-6 flex flex-wrap gap-3'>
              {regionFilter && (
                <span className='flex items-center px-3 py-1.5 bg-green-50 border border-green-100 text-sm text-green-800 rounded-full'>
                  {getRegionName(Number(regionFilter))}
                  <button
                    className='ml-1.5 hover:bg-green-100 rounded-full p-0.5 transition-colors'
                    onClick={() => setRegionFilter('')}
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-4 w-4'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={1.5}
                        d='M6 18L18 6M6 6l12 12'
                      />
                    </svg>
                  </button>
                </span>
              )}

              {phinmaFilter && (
                <span className='flex items-center px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-sm text-indigo-800 rounded-full'>
                  {phinmaFilter === 'phinma'
                    ? 'PHINMA Schools'
                    : 'Non-PHINMA Schools'}
                  <button
                    className='ml-1.5 hover:bg-indigo-100 rounded-full p-0.5 transition-colors'
                    onClick={() => setPhinmaFilter('')}
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-4 w-4'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={1.5}
                        d='M6 18L18 6M6 6l12 12'
                      />
                    </svg>
                  </button>
                </span>
              )}

              {(regionFilter || phinmaFilter || searchTerm) && (
                <button
                  className='text-sm text-red-800 hover:text-red-600 transition-colors ml-1 font-medium'
                  onClick={clearFilters}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Schools Table */}
          <div className='bg-white border border-gray-100 rounded-xl overflow-hidden mb-8'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th
                      scope='col'
                      className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      <div className='flex items-center'>
                        School Name
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4 ml-1 text-gray-400'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={1.5}
                            d='M8 9l4-4 4 4m0 6l-4 4-4-4'
                          />
                        </svg>
                      </div>
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Region
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      PHINMA
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {currentSchools.length > 0 ? (
                    currentSchools.map((school) => (
                      <tr
                        key={school._id || school.id}
                        className='hover:bg-gray-50 transition-colors'
                      >
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm font-medium text-gray-900'>
                            {school.school}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm text-gray-600'>
                            {getRegionName(school.region_id)}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span
                            className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                              school.is_phinma
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {school.is_phinma ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='flex gap-2'>
                            <button
                              className='text-blue-600 hover:text-blue-800 p-1 disabled:opacity-50'
                              onClick={() => handleEdit(school)}
                              title='Edit School'
                              disabled={isLoading}
                            >
                              <Edit className='h-4 w-4' />
                            </button>
                            <button
                              className={`text-red-600 hover:text-red-800 p-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                                isSchoolInUse(school)
                                  ? 'bg-orange-50 text-orange-500 border border-orange-200 p-2 rounded-lg'
                                  : ''
                              }`}
                              onClick={() => handleDeleteConfirmation(school)}
                              disabled={isSchoolInUse(school)}
                              aria-label={
                                isSchoolInUse(school)
                                  ? 'Cannot delete: school is in use'
                                  : 'Delete'
                              }
                              title={
                                isSchoolInUse(school)
                                  ? 'Cannot delete: school is in use'
                                  : 'Delete'
                              }
                            >
                              <Trash2 className='h-4 w-4' />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan='4'
                        className='px-6 py-4 text-center text-sm text-gray-500'
                      >
                        No schools found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className='bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between'>
              <div className='text-sm text-gray-600'>
                Showing{' '}
                <span className='font-medium'>
                  {filteredSchools.length > 0 ? indexOfFirstSchool + 1 : 0}
                </span>{' '}
                to{' '}
                <span className='font-medium'>
                  {indexOfLastSchool > filteredSchools.length
                    ? filteredSchools.length
                    : indexOfLastSchool}
                </span>{' '}
                of <span className='font-medium'>{filteredSchools.length}</span>{' '}
                results
              </div>
              <div className='flex items-center space-x-2'>
                <button
                  className='px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                >
                  Previous
                </button>
                <button
                  className='px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* School Form Modal */}
          <SchoolFormModal
            isOpen={isSchoolModalOpen}
            onClose={() => setIsSchoolModalOpen(false)}
            onSubmit={handleSchoolFormSubmit}
            school={selectedSchool}
            isEditing={isEditing}
            regions={regions}
          />

          {/* Delete Confirmation Modal */}
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteSchool}
            title='Delete School'
            message={
              selectedSchool
                ? `Are you sure you want to delete ${selectedSchool.school}?`
                : ''
            }
          />
        </>
      )}
    </div>
  );
}
