'use client';
import StatisticsFormModal from '../components/StatisticsFormModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { useState, useEffect } from 'react';
import CustomSelect from '@/app/components/CustomSelect'; // Import CustomSelect
import { statisticsService } from '../../../services/dataManagement/statisticsService';

export default function StatisticsDataManagement() {
  // State for data management
  const [isLoading, setIsLoading] = useState(true); // Set initial loading to true
  const [error, setError] = useState(null);
  const [statisticsData, setStatisticsData] = useState([]); // Initial empty array
  const [programs, setPrograms] = useState([]); // Initial empty array
  const [schools, setSchools] = useState([]); // Initial empty array

  // Modal states
  const [isStatisticsModalOpen, setIsStatisticsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStatistic, setSelectedStatistic] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Stats
  const [statisticsStats, setStatisticsStats] = useState({
    total: 0,
    averagePassingRate: 0,
    averageFailingRate: 0,
    yearRange: { min: null, max: null },
  });

  // Fetch all data on component mount - Modified for hardcoded data
  useEffect(() => {
    fetchAllData();
  }, []);

  // Function to fetch all required data - Modified for hardcoded data
  const fetchAllData = async () => {
    // No fetching, just set initial state
    setIsLoading(true); // Keep brief loading state
    setError(null);

    try {
      // Hardcoded empty data
      const statsData = [];
      const programData = [];
      const schoolData = [];

      setStatisticsData(statsData);
      setPrograms(programData);
      setSchools(schoolData);

      // Calculate stats from hardcoded data (will be 0 or null)
      const totalStats = 0;
      let averagePassingRate = 0;
      let averageFailingRate = 0;
      const minYear = null;
      const maxYear = null;

      setStatisticsStats({
        total: totalStats,
        averagePassingRate,
        averageFailingRate,
        yearRange: { min: minYear, max: maxYear },
      });
    } catch (err) {
      console.error('Error setting up hardcoded data:', err);
      setError('Failed to set up initial data');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle opening statistics modal for creating a new statistic
  const handleAddStatistic = () => {
    setSelectedStatistic(null);
    setIsEditing(false);
    setIsStatisticsModalOpen(true);
  };

  // Function to handle statistic edit
  const handleEdit = (statistic) => {
    setSelectedStatistic(statistic);
    setIsEditing(true);
    setIsStatisticsModalOpen(true);
  };

  // Function to handle delete confirmation
  const handleDeleteConfirmation = (statistic) => {
    setSelectedStatistic(statistic);
    setIsDeleteModalOpen(true);
  };

  // Function to handle statistic deletion - Modified to do nothing
  const handleDeleteStatistic = async () => {
    console.log('Delete statistic action disabled (using hardcoded data).');
    setIsDeleteModalOpen(false);
    // setIsLoading(true);
    // try {
    //   await api.deleteStatisticsData(selectedStatistic.id);
    //   fetchAllData();
    //   setIsDeleteModalOpen(false);
    // } catch (err) {
    //   setError(err.message || 'Failed to delete statistic');
    // } finally {
    //   setIsLoading(false);
    // }
  };

  // Function to handle form submission from modal - Modified to do nothing
  const handleStatisticsFormSubmit = async (statisticData) => {
    console.log(
      'Statistics form submit disabled (using hardcoded data).',
      statisticData
    );
    setIsStatisticsModalOpen(false);
    // setIsLoading(true);
    // try {
    //   if (isEditing) {
    //     await api.updateStatisticsData(selectedStatistic.id, statisticData);
    //   } else {
    //     await api.createStatisticsData(statisticData);
    //   }
    //   setIsStatisticsModalOpen(false);
    //   fetchAllData();
    // } catch (err) {
    //   setError(err.message || 'Failed to save statistic');
    // } finally {
    //   setIsLoading(false);
    // }
  };

  // Function to filter statistics based on search and filters
  const filteredStatistics = Array.isArray(statisticsData)
    ? statisticsData.filter((statistic) => {
        // Apply search term filter (search in program name or school name)
        const program = programs.find((p) => p.id === statistic.program_id);
        const school = schools.find((s) => s.id === statistic.school_id);

        const programName = program ? program.program.toLowerCase() : '';
        const schoolName = school ? school.school.toLowerCase() : '';

        const searchMatch =
          searchTerm === '' ||
          programName.includes(searchTerm.toLowerCase()) ||
          schoolName.includes(searchTerm.toLowerCase());

        // Apply year filter
        const yearMatch =
          yearFilter === '' ||
          (statistic.year && statistic.year.toString() === yearFilter);

        // Apply program filter
        const programMatch =
          programFilter === '' ||
          (statistic.program_id &&
            statistic.program_id.toString() === programFilter);

        // Apply school filter
        const schoolMatch =
          schoolFilter === '' ||
          (statistic.school_id &&
            statistic.school_id.toString() === schoolFilter);

        return searchMatch && yearMatch && programMatch && schoolMatch;
      })
    : [];

  // Calculate pagination
  const indexOfLastStatistic = currentPage * itemsPerPage;
  const indexOfFirstStatistic = indexOfLastStatistic - itemsPerPage;
  const currentStatistics = filteredStatistics.slice(
    indexOfFirstStatistic,
    indexOfLastStatistic
  );
  const totalPages = Math.ceil(filteredStatistics.length / itemsPerPage);

  // Function to clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setYearFilter('');
    setProgramFilter('');
    setSchoolFilter('');
    setCurrentPage(1);
  };

  // Function to get program name by id
  const getProgramName = (programId) => {
    const program = programs.find((p) => p.id === programId);
    return program ? program.program : 'Unknown';
  };

  // Function to get school name by id
  const getSchoolName = (schoolId) => {
    const school = schools.find((s) => s.id === schoolId);
    return school ? school.school : 'Unknown';
  };

  // Function to get available years from data
  const getAvailableYears = () => {
    if (!Array.isArray(statisticsData)) return [];

    const uniqueYears = [
      ...new Set(
        statisticsData
          .filter((stat) => stat && stat.year)
          .map((stat) => stat.year)
      ),
    ];
    return uniqueYears.sort((a, b) => b - a); // Sort descending (newest first)
  };

  const handleCreate = async (statisticsData) => {
    try {
      const newStatistics = await statisticsService.create(statisticsData);
      setStatisticsData([...statisticsData, newStatistics]);
    } catch (error) {
      console.error('Failed to create statistics:', error);
      throw error;
    }
  };

  const handleUpdate = async (id, statisticsData) => {
    try {
      const updatedStatistics = await statisticsService.update(
        id,
        statisticsData
      );
      setStatisticsData(
        statisticsData.map((stat) =>
          stat._id === id ? updatedStatistics : stat
        )
      );
    } catch (error) {
      console.error('Failed to update statistics:', error);
      throw error;
    }
  };

  // Function to handle delete using service
  const handleDelete = async (id) => {
    try {
      await statisticsService.delete(id);
      setStatisticsData(statisticsData.filter((stat) => stat._id !== id));
    } catch (error) {
      console.error('Failed to delete statistics:', error);
      throw error;
    }
  };

  return (
    <div className='statistics-data-management'>
      {/* Error Alert */}
      {error && (
        <div className='border-l-4 border-red-600 bg-red-50 text-red-800 px-6 py-4 rounded-md mb-10 flex items-start'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-6 w-6 text-red-600 mr-3 mt-0.5 flex-shrink-0'
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <path
              fillRule='evenodd'
              d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
              clipRule='evenodd'
            />
          </svg>
          <div>
            <h3 className='font-semibold text-red-800 text-lg'>
              Failed to load data
            </h3>
            <p className='text-red-700 mt-1'>{error}</p>
            <button
              className='mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors text-sm font-medium'
              onClick={fetchAllData}
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className='flex justify-center items-center py-10'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-800'></div>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Statistics Layout */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
            {/* Statistics Data Statistics */}
            <div className='border border-gray-100 rounded-xl p-6 bg-gradient-to-br from-white to-purple-50'>
              <h2 className='text-xl font-semibold text-red-800 mb-5'>
                Statistics Overview
              </h2>

              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Total Records</span>
                  <span className='font-medium text-gray-900 text-lg'>
                    {statisticsStats.total}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Average Passing Rate</span>
                  <span className='font-medium text-gray-900 text-lg'>
                    {statisticsStats.averagePassingRate.toFixed(2)}%
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Average Failing Rate</span>
                  <span className='font-medium text-gray-900 text-lg'>
                    {statisticsStats.averageFailingRate.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Year Range */}
            <div className='border border-gray-100 rounded-xl p-6 bg-gradient-to-br from-white to-cyan-50'>
              <h2 className='text-xl font-semibold text-red-800 mb-5'>
                Year Range
              </h2>

              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Earliest Year</span>
                  <span className='font-medium text-gray-900 text-lg'>
                    {statisticsStats.yearRange.min || 'N/A'}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Latest Year</span>
                  <span className='font-medium text-gray-900 text-lg'>
                    {statisticsStats.yearRange.max || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Add Statistics Button */}
          <div className='mb-6'>
            <button
              onClick={handleAddStatistic}
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
              Add New Statistics Data
            </button>
          </div>

          {/* Search and Filter */}
          <div className='bg-white border border-gray-100 rounded-xl p-6 mb-8'>
            <div className='relative mb-6'>
              <input
                id='statistics-search'
                name='statistics-search'
                aria-label='Search statistics records'
                type='text'
                autoComplete='off'
                className='w-full border border-gray-200 p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent'
                placeholder='Search programs or schools...'
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

            <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
              <div>
                <CustomSelect
                  id='year-filter'
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  options={[
                    { value: '', label: 'All Years' },
                    ...(getAvailableYears().map((year) => ({
                      value: year.toString(),
                      label: year.toString(),
                    })) || []),
                  ]}
                  placeholder='All Years'
                  className=''
                />
              </div>
              <div>
                <CustomSelect
                  id='school-filter'
                  value={schoolFilter}
                  onChange={(e) => setSchoolFilter(e.target.value)}
                  options={[
                    { value: '', label: 'All Schools' },
                    ...(schools.map((school) => ({
                      value: school.id.toString(),
                      label: school.school,
                    })) || []),
                  ]}
                  placeholder='All Schools'
                  className=''
                />
              </div>
              <div>
                <CustomSelect
                  id='program-filter'
                  value={programFilter}
                  onChange={(e) => setProgramFilter(e.target.value)}
                  options={[
                    { value: '', label: 'All Programs' },
                    ...(programs.map((program) => ({
                      value: program.id.toString(),
                      label: program.program,
                    })) || []),
                  ]}
                  placeholder='All Programs'
                  className=''
                />
              </div>
            </div>

            <div className='mt-6 flex flex-wrap gap-3'>
              {yearFilter && (
                <span className='flex items-center px-3 py-1.5 bg-cyan-50 border border-cyan-100 text-sm text-cyan-800 rounded-full'>
                  Year: {yearFilter}
                  <button
                    className='ml-1.5 hover:bg-cyan-100 rounded-full p-0.5 transition-colors'
                    onClick={() => setYearFilter('')}
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

              {schoolFilter && (
                <span className='flex items-center px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-sm text-indigo-800 rounded-full'>
                  {getSchoolName(Number(schoolFilter))}
                  <button
                    className='ml-1.5 hover:bg-indigo-100 rounded-full p-0.5 transition-colors'
                    onClick={() => setSchoolFilter('')}
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

              {programFilter && (
                <span className='flex items-center px-3 py-1.5 bg-purple-50 border border-purple-100 text-sm text-purple-800 rounded-full'>
                  {getProgramName(Number(programFilter))}
                  <button
                    className='ml-1.5 hover:bg-purple-100 rounded-full p-0.5 transition-colors'
                    onClick={() => setProgramFilter('')}
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

              {(yearFilter || schoolFilter || programFilter || searchTerm) && (
                <button
                  className='text-sm text-red-800 hover:text-red-600 transition-colors ml-1 font-medium'
                  onClick={clearFilters}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Statistics Table */}
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
                        School
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
                      Program
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Year
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Passing Rate
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Failing Rate
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
                  {currentStatistics.length > 0 ? (
                    currentStatistics.map((statistic) => (
                      <tr
                        key={statistic.id}
                        className='hover:bg-gray-50 transition-colors'
                      >
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm font-medium text-gray-900'>
                            {getSchoolName(statistic.school_id)}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm font-medium text-gray-900'>
                            {getProgramName(statistic.program_id)}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm text-gray-600'>
                            {statistic.year}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm text-green-600 font-medium'>
                            {statistic.passing_rate}%
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm text-red-600 font-medium'>
                            {statistic.failing_rate}%
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='flex space-x-3'>
                            <button
                              className='text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors'
                              onClick={() => handleEdit(statistic)}
                            >
                              Edit
                            </button>
                            <button
                              className='text-red-600 hover:text-red-800 text-sm font-medium transition-colors'
                              onClick={() =>
                                handleDeleteConfirmation(statistic)
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan='6'
                        className='px-6 py-4 text-center text-sm text-gray-500'
                      >
                        No statistics data found
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
                  {filteredStatistics.length > 0
                    ? indexOfFirstStatistic + 1
                    : 0}
                </span>{' '}
                to{' '}
                <span className='font-medium'>
                  {indexOfLastStatistic > filteredStatistics.length
                    ? filteredStatistics.length
                    : indexOfLastStatistic}
                </span>{' '}
                of{' '}
                <span className='font-medium'>{filteredStatistics.length}</span>{' '}
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

          {/* Statistics Form Modal */}
          <StatisticsFormModal
            isOpen={isStatisticsModalOpen}
            onClose={() => setIsStatisticsModalOpen(false)}
            onSubmit={handleStatisticsFormSubmit}
            statistic={selectedStatistic}
            isEditing={isEditing}
            programs={programs}
            schools={schools}
          />

          {/* Delete Confirmation Modal */}
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteStatistic}
            title='Delete Statistics Data'
            message={
              selectedStatistic
                ? `Are you sure you want to delete the statistics data for ${getProgramName(
                    selectedStatistic.program_id
                  )} at ${getSchoolName(selectedStatistic.school_id)} (${
                    selectedStatistic.year
                  })?`
                : ''
            }
          />
        </>
      )}
    </div>
  );
}
