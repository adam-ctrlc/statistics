'use client';

import { useState, useEffect, useMemo } from 'react';
// Use the dedicated modal backed by backend API services
import NationalRateFormModal from '../components/NationalRateFormModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import {
  Plus,
  Search, // Keep if searching by year
  RefreshCw,
  Edit,
  Trash2,
  TrendingUp,
  BarChartHorizontal, // Icon for this section
  Filter,
  X,
  Calendar,
  Percent,
} from '@/app/components/icons';
import AlertMessage from '@/app/(login)/profile/components/AlertMessage';
import LoadingIndicator from '@/app/(login)/profile/components/LoadingIndicator';
import CustomSelect from '@/app/components/CustomSelect'; // Import CustomSelect
import { nationalPassingRateService } from '../../../services/dataManagement/nationalPassingRateService';
import { programService } from '../../../services/dataManagement/programService';

const ITEMS_PER_PAGE = 10;

export default function NationalPassingRatesManagement() {
  // Data State - simplified
  const [nationalRates, setNationalRates] = useState([]);
  // const [options, setOptions] = useState({ existingYears: [] }); // Optional
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [deleteState, setDeleteState] = useState({
    loading: false,
    error: null,
    success: null,
  });

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Filters & Pagination - Simplified to year filter
  const [yearFilter, setYearFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [isMutating, setIsMutating] = useState(false);

  // Add state for months, programs, and filters
  const [monthFilter, setMonthFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [programs, setPrograms] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);

  // --- Data Fetching ---
  const loadData = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await nationalPassingRateService.getAll();
      if (error) throw error;
      setNationalRates(data || []);
    } catch (err) {
      console.error('Error loading national passing rate data:', err);
      setFetchError(
        err.message || 'An unexpected error occurred while loading data.'
      );
      setNationalRates([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch programs and months
  useEffect(() => {
    async function fetchProgramsAndMonths() {
      try {
        const res = await programService.getAll();
        setPrograms(res.data || []);
        // Extract unique months from data
        const months = new Set(
          (nationalRates || []).map((rate) => rate.month).filter(Boolean)
        );
        setAvailableMonths(Array.from(months));
      } catch (err) {
        setPrograms([]);
        setAvailableMonths([]);
      }
    }
    fetchProgramsAndMonths();
  }, [nationalRates]);

  // --- Modal Handling ---
  const handleAddRate = () => {
    setSelectedRate(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditRate = (rate) => {
    setSelectedRate(rate);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDeleteRate = (rate) => {
    setSelectedRate(rate);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRate(null);
  };

  // --- Add/Edit Handlers ---
  const handleFormSubmit = async (formData) => {
    setIsMutating(true);
    try {
      if (isEditing && selectedRate) {
        // Update
        const updated = await nationalPassingRateService.update(
          selectedRate._id,
          Object.fromEntries(formData.entries())
        );
        setNationalRates((prev) =>
          prev.map((rate) => (rate._id === selectedRate._id ? updated : rate))
        );
      } else {
        // Add
        const created = await nationalPassingRateService.create(
          Object.fromEntries(formData.entries())
        );
        setNationalRates((prev) => [...prev, created]);
      }
      setIsModalOpen(false);
      setSelectedRate(null);
    } catch (err) {
      setFetchError(err?.message || 'An error occurred.');
    } finally {
      setIsMutating(false);
    }
  };

  // --- Deletion Handling ---
  const confirmDeleteRate = async () => {
    if (!selectedRate) return;
    setDeleteState({ loading: true, error: null, success: null });
    try {
      // Use the specific delete action for national rates
      await nationalPassingRateService.delete(selectedRate._id);
      setDeleteState({
        loading: false,
        error: null,
        success: 'National passing rate deleted successfully.',
      });
      loadData();
    } catch (err) {
      console.error('Error during deletion:', err);
      setDeleteState({
        loading: false,
        error: 'An unexpected error occurred during deletion.',
        success: null,
      });
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedRate(null);
      setTimeout(
        () => setDeleteState({ loading: false, error: null, success: null }),
        3000
      );
    }
  };

  // --- Filtering & Pagination --- Filtering logic by year
  const filteredNationalRates = useMemo(() => {
    return (nationalRates || []).filter((rate) => {
      const yearMatch =
        yearFilter === '' || rate.year?.toString() === yearFilter;
      const monthMatch = monthFilter === '' || rate.month === monthFilter;
      const programMatch =
        programFilter === '' ||
        rate.program_id === programFilter ||
        rate.program_id?._id === programFilter;
      return yearMatch && monthMatch && programMatch;
    });
  }, [nationalRates, yearFilter, monthFilter, programFilter]);

  // --- Pagination Calculation ---
  const totalPages = Math.ceil(filteredNationalRates.length / ITEMS_PER_PAGE);
  const currentNationalRates = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredNationalRates.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredNationalRates, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const clearFilters = () => {
    setYearFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters = !!yearFilter;

  // Extract unique years for the year filter dropdown
  const availableYearsFilter = useMemo(() => {
    const years = new Set(
      nationalRates.map((rate) => rate.year).filter(Boolean)
    );
    // Data is sorted by year descending in the action, so no need to sort here
    return Array.from(years);
  }, [nationalRates]);

  // --- Stats Calculation ---
  const rateStats = useMemo(() => {
    const total = nationalRates.length;
    let averageRate = 0;
    if (total > 0) {
      const sum = nationalRates.reduce(
        (acc, curr) => acc + (curr.rate || 0),
        0
      );
      averageRate = (sum / total).toFixed(1); // One decimal place
    }
    const years = nationalRates
      .map((r) => parseInt(r.year, 10))
      .filter((y) => !isNaN(y));
    const minYear = years.length > 0 ? Math.min(...years) : null;
    const maxYear = years.length > 0 ? Math.max(...years) : null;

    return {
      total,
      averageRate,
      yearRange: { min: minYear, max: maxYear },
    };
  }, [nationalRates]);

  return (
    <section className='space-y-6'>
      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <div className='bg-white border border-gray-100 rounded-lg p-4 flex items-center gap-4'>
          <div className='p-2 bg-blue-100 rounded-md'>
            <BarChartHorizontal
              className='h-5 w-5 text-blue-600'
              strokeWidth={1.5}
            />
          </div>
          <div>
            <p className='text-sm text-gray-500'>Total Records</p>
            <p className='text-xl font-semibold text-gray-900'>
              {rateStats.total}
            </p>
          </div>
        </div>
        <div className='bg-white border border-gray-100 rounded-lg p-4 flex items-center gap-4'>
          <div className='p-2 bg-green-100 rounded-md'>
            <Percent className='h-5 w-5 text-green-600' strokeWidth={1.5} />
          </div>
          <div>
            <p className='text-sm text-gray-500'>Average National Rate</p>
            <p className='text-xl font-semibold text-gray-900'>
              {rateStats.averageRate}%
            </p>
          </div>
        </div>
        <div className='bg-white border border-gray-100 rounded-lg p-4 flex items-center gap-4'>
          <div className='p-2 bg-orange-100 rounded-md'>
            <Calendar className='h-5 w-5 text-orange-600' strokeWidth={1.5} />
          </div>
          <div>
            <p className='text-sm text-gray-500'>Year Range</p>
            <p className='text-xl font-semibold text-gray-900'>
              {rateStats.yearRange.min} - {rateStats.yearRange.max}
            </p>
          </div>
        </div>
      </div>

      {(fetchError || deleteState.error || deleteState.success) && (
        <div className="min-h-[40px]">
          {/* Prevent layout shift */}
          {fetchError && <AlertMessage message={fetchError} type="error" />}
          {deleteState.error && (
            <AlertMessage message={deleteState.error} type="error" />
          )}
          {deleteState.success && (
            <AlertMessage message={deleteState.success} type="success" />
          )}
        </div>
      )}

      {/* Table Section */}
      <div className='bg-white border border-gray-100 rounded-lg'>
        <div className='flex flex-col md:flex-row justify-between items-center gap-4 p-4 border-b border-gray-100'>
          {/* Filters - Simplified to Year */}
          <div className='flex flex-wrap items-center gap-2 w-full md:w-auto'>
            <CustomSelect
              id='year-filter'
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: '', label: 'All Years' },
                ...(availableYearsFilter.map((year) => ({
                  value: year.toString(),
                  label: year.toString(),
                })) || []),
              ]}
              placeholder='All Years'
              className=''
            />

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className='p-2 text-gray-500 hover:text-red-600'
                title='Clear Filters'
              >
                <X className='h-4 w-4' />
              </button>
            )}
          </div>

          {/* Add filters for month and program */}
          <div className='flex flex-wrap items-center gap-2 w-full md:w-auto'>
            <CustomSelect
              id='month-filter'
              value={monthFilter}
              onChange={(e) => {
                setMonthFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: '', label: 'All Months' },
                ...(availableMonths.map((month) => ({
                  value: month,
                  label: month,
                })) || []),
              ]}
              placeholder='All Months'
              className='mr-2'
            />
            <CustomSelect
              id='program-filter'
              value={programFilter}
              onChange={(e) => {
                setProgramFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: '', label: 'All Programs' },
                ...(programs.map((p) => ({ value: p._id, label: p.program })) ||
                  []),
              ]}
              placeholder='All Programs'
              className='mr-2'
            />
          </div>

          {/* Action Buttons */}
          <div className='flex items-center gap-2 flex-shrink-0'>
            <button
              onClick={loadData}
              className='p-2 text-gray-500 hover:text-red-600'
              title='Refresh Data'
              disabled={isLoading || isMutating}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
            </button>
            <button
              onClick={handleAddRate}
              className='inline-flex items-center gap-1.5 bg-red-700 text-white px-3 py-2 text-sm font-medium rounded-lg hover:bg-red-800 transition-colors'
            >
              <Plus className='h-4 w-4' strokeWidth={2} />
              Add National Rate
            </button>
          </div>
        </div>

        {/* Table */}
        <div className='overflow-x-auto'>
          {isLoading ? (
            <LoadingIndicator />
          ) : currentNationalRates.length > 0 ? (
            <table className='min-w-full divide-y divide-gray-100'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Year
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Month
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Program
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Passing Rate (%)
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-100'>
                {currentNationalRates.map((rate) => {
                  const programObj = programs.find(
                    (p) => p._id === (rate.program_id?._id || rate.program_id)
                  );
                  return (
                    <tr key={rate._id}>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {rate.year}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {rate.month}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {programObj ? programObj.program : 'Unknown'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {rate.passing_rate?.toFixed(1)}%
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2'>
                        <button
                          onClick={() => handleEditRate(rate)}
                          className='text-blue-600 hover:text-blue-800 p-1 disabled:opacity-50'
                          title='Edit National Rate'
                          disabled={isMutating}
                        >
                          <Edit className='h-4 w-4' />
                        </button>
                        <button
                          onClick={() => handleDeleteRate(rate)}
                          className='text-red-600 hover:text-red-800 p-1 disabled:opacity-50'
                          title='Delete National Rate'
                          disabled={isMutating}
                        >
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className='text-center py-10 text-gray-500'>
              {hasActiveFilters
                ? 'No national rates found matching your filter.'
                : 'No national rates recorded yet. Click "Add National Rate" to start.'}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && !isLoading && (
          <div className='p-4 border-t border-gray-100 flex items-center justify-between'>
            <span className='text-sm text-gray-600'>
              Showing
              {filteredNationalRates.length > 0
                ? (currentPage - 1) * ITEMS_PER_PAGE + 1
                : 0}
              -{' '}
              {Math.min(
                currentPage * ITEMS_PER_PAGE,
                filteredNationalRates.length
              )}{' '}
              of {filteredNationalRates.length} results
            </span>
            <div className='flex gap-1'>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isMutating}
                className='px-3 py-1 border border-gray-200 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50'
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isMutating}
                className='px-3 py-1 border border-gray-200 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50'
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {/* Use the new NationalRateFormModal */}
      <NationalRateFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        formAction={handleFormSubmit}
        rate={selectedRate} // Pass the selected rate for editing
        isEditing={isEditing}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteRate}
        title='Delete National Passing Rate'
        message={`Are you sure you want to delete the national passing rate for ${selectedRate?.year}? This action cannot be undone.`}
      />
    </section>
  );
}
