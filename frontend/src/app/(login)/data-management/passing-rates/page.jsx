'use client';

import {
  useState,
  useEffect,
  useMemo,
  startTransition,
} from 'react';
import PassingRateFormModal from '../components/PassingRateFormModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import {
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  TrendingUp,
  BookCopy,
  Filter,
  X,
  CalendarDays,
  Percent,
} from '@/app/components/icons';
import AlertMessage from '@/app/(login)/profile/components/AlertMessage';
import LoadingIndicator from '@/app/(login)/profile/components/LoadingIndicator';
import CustomSelect from '@/app/components/CustomSelect';
import { passingRateService } from '../../../services/dataManagement/passingRateService';
import { programService } from '../../../services/dataManagement/programService';

const ITEMS_PER_PAGE = 10;

export default function PassingRateManagement() {
  // Data State
  const [passingRates, setPassingRates] = useState([]);
  const [options, setOptions] = useState({ programs: [] });
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

  // Filters & Pagination
  const [programFilter, setProgramFilter] = useState('');
  const [yearFilter, setYearFilter] = useState(''); // Add year filter
  const [currentPage, setCurrentPage] = useState(1);

  const [actionState, setActionState] = useState({ type: null, message: null });
  const [isMutating, setIsMutating] = useState(false);

  // --- Data Fetching ---
  const loadData = async () => {
    startTransition(() => {
      setIsLoading(true);
      setFetchError(null);
    });
    try {
      const [ratesResult, programsResult] = await Promise.all([
        passingRateService.getAll(),
        programService.getAll(),
      ]);

      if (ratesResult.error) {
        setFetchError(ratesResult.error.message || 'Failed to load passing rates.');
        setPassingRates([]);
      } else {
        setPassingRates(ratesResult.data || []);
      }

      if (programsResult.error) {
        setOptions({ programs: [] });
      } else {
        setOptions({ programs: programsResult.data || [] });
      }
    } catch (err) {
      console.error('Error loading passing rate data:', err);
      setFetchError('An unexpected error occurred while loading data.');
      setPassingRates([]);
      setOptions({ programs: [] });
    } finally {
      startTransition(() => {
        setIsLoading(false);
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
    // Reset action states if needed, though useActionState handles this somewhat
  };

  const handleFormSubmit = async (rawFormData) => {
    setIsMutating(true);
    setActionState({ type: null, message: null });
    try {
      const form = Object.fromEntries(rawFormData.entries());
      const payload = {
        month: form.month,
        year: form.year,
        passing_rate: Number(form.passing_rate),
        program_id: form.program_id,
      };

      if (isEditing && selectedRate) {
        await passingRateService.update(selectedRate._id || selectedRate.id, payload);
        setActionState({ type: 'success', message: 'Passing rate updated successfully.' });
      } else {
        await passingRateService.create(payload);
        setActionState({ type: 'success', message: 'Passing rate created successfully.' });
      }

      setIsModalOpen(false);
      setSelectedRate(null);
      await loadData();
    } catch (err) {
      setActionState({ type: 'error', message: err.message || 'Failed to save passing rate.' });
    } finally {
      setIsMutating(false);
    }
  };

  // --- Deletion Handling ---
  const confirmDeleteRate = async () => {
    if (!selectedRate) return;
      setDeleteState({ loading: true, error: null, success: null });
      setIsMutating(true);
      try {
      await passingRateService.delete(selectedRate._id || selectedRate.id);
        setDeleteState({
          loading: false,
          error: null,
          success: 'Passing rate deleted successfully.',
        });
        loadData(); // Reload data on successful delete
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
      setIsMutating(false);
      // Clear message after a few seconds
      setTimeout(
        () => setDeleteState({ loading: false, error: null, success: null }),
        3000
      );
    }
  };

  // --- Filtering & Pagination --- Filtering logic
  const filteredPassingRates = useMemo(() => {
    return (passingRates || []).filter((rate) => {
      const programMatch =
        programFilter === '' || rate.program_id?.toString() === programFilter;
      const yearMatch =
        yearFilter === '' || rate.year?.toString() === yearFilter;
      return programMatch && yearMatch;
    });
  }, [passingRates, programFilter, yearFilter]);

  // --- Pagination Calculation ---
  const totalPages = Math.ceil(filteredPassingRates.length / ITEMS_PER_PAGE);
  const currentPassingRates = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPassingRates.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPassingRates, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const clearFilters = () => {
    setProgramFilter('');
    setYearFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters = programFilter || yearFilter;

  // Extract unique years for the year filter dropdown
  const availableYearsFilter = useMemo(() => {
    const years = new Set(
      passingRates.map((rate) => rate.year).filter(Boolean)
    );
    return Array.from(years).sort((a, b) => b - a); // Sort descending
  }, [passingRates]);

  // --- Stats Calculation ---
  const rateStats = useMemo(() => {
    const total = passingRates.length;
    let averageRate = 0;
    if (total > 0) {
      const sum = passingRates.reduce(
        (acc, curr) => acc + (curr.passing_rate || 0),
        0
      );
      averageRate = (sum / total).toFixed(1); // One decimal place
    }
    return {
      total,
      averageRate,
    };
  }, [passingRates]);

  const handleCreate = async (passingRateData) => {
    try {
      const newPassingRate = await passingRateService.create(passingRateData);
      setPassingRates([...passingRates, newPassingRate]);
    } catch (error) {
      console.error('Failed to create passing rate:', error);
      throw error;
    }
  };

  const handleUpdate = async (id, passingRateData) => {
    try {
      const updatedPassingRate = await passingRateService.update(
        id,
        passingRateData
      );
      setPassingRates(
        passingRates.map((rate) =>
          rate._id === id ? updatedPassingRate : rate
        )
      );
    } catch (error) {
      console.error('Failed to update passing rate:', error);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    try {
      await passingRateService.delete(id);
      setPassingRates(passingRates.filter((rate) => rate._id !== id));
    } catch (error) {
      console.error('Failed to delete passing rate:', error);
      throw error;
    }
  };

  return (
    <section className='space-y-6'>
      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='bg-white border border-gray-100 rounded-lg p-4 flex items-center gap-4'>
          <div className='p-2 bg-purple-100 rounded-md'>
            <TrendingUp className='h-5 w-5 text-purple-600' strokeWidth={1.5} />
          </div>
          <div>
            <p className='text-sm text-gray-500'>Total Records</p>
            <p className='text-xl font-semibold text-gray-900'>
              {rateStats.total}
            </p>
          </div>
        </div>
        <div className='bg-white border border-gray-100 rounded-lg p-4 flex items-center gap-4'>
          <div className='p-2 bg-yellow-100 rounded-md'>
            <Percent className='h-5 w-5 text-yellow-600' strokeWidth={1.5} />
          </div>
          <div>
            <p className='text-sm text-gray-500'>Average Passing Rate</p>
            <p className='text-xl font-semibold text-gray-900'>
              {rateStats.averageRate}%
            </p>
          </div>
        </div>
      </div>

      {/* Action/Error Display Area */}
      <div className='min-h-[40px]'>
        {fetchError && <AlertMessage message={fetchError} type='error' />}
        {actionState.type === 'error' && (
          <AlertMessage message={actionState.message} type='error' />
        )}
        {actionState.type === 'success' && (
          <AlertMessage message={actionState.message} type='success' />
        )}
        {deleteState.error && (
          <AlertMessage message={deleteState.error} type='error' />
        )}
        {deleteState.success && (
          <AlertMessage message={deleteState.success} type='success' />
        )}
      </div>

      {/* Table Section */}
      <div className='bg-white border border-gray-100 rounded-lg'>
        <div className='flex flex-col md:flex-row justify-between items-center gap-4 p-4 border-b border-gray-100'>
          {/* Filters */}
          <div className='flex flex-wrap items-center gap-2 w-full md:w-auto'>
            <CustomSelect
              id='program-filter'
              value={programFilter}
              onChange={(e) => {
                setProgramFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: '', label: 'All Programs' },
                ...(options.programs?.map((p) => ({
                  value: (p._id || p.id || '').toString(),
                  label: p.program,
                })) || []),
              ]}
              placeholder='All Programs'
              className=''
            />

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
              Add Rate
            </button>
          </div>
        </div>

        {/* Table */}
        <div className='overflow-x-auto'>
          {isLoading ? (
            <LoadingIndicator />
          ) : currentPassingRates.length > 0 ? (
            <table className='min-w-full divide-y divide-gray-100'>
              <thead className='bg-gray-50'>
                <tr>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Program
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Month
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Year
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Passing Rate (%)
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-100'>
                {currentPassingRates.map((rate) => (
                  <tr key={rate._id || rate.id}>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      {rate.program_id?.program || 'N/A'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {rate.month}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {rate.year}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {rate.passing_rate?.toFixed(1)}%
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2'>
                      <button
                        onClick={() => handleEditRate(rate)}
                        className='text-blue-600 hover:text-blue-800 p-1 disabled:opacity-50'
                        title='Edit Passing Rate'
                        disabled={isMutating}
                      >
                        <Edit className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() => handleDeleteRate(rate)}
                        className='text-red-600 hover:text-red-800 p-1 disabled:opacity-50'
                        title='Delete Passing Rate'
                        disabled={isMutating}
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className='text-center py-10 text-gray-500'>
              {hasActiveFilters
                ? 'No passing rates found matching your filters.'
                : 'No passing rates recorded yet. Click "Add Rate" to start.'}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && !isLoading && (
          <div className='p-4 border-t border-gray-100 flex items-center justify-between'>
            <span className='text-sm text-gray-600'>
              Showing{' '}
              {filteredPassingRates.length > 0
                ? (currentPage - 1) * ITEMS_PER_PAGE + 1
                : 0}
              -{' '}
              {Math.min(
                currentPage * ITEMS_PER_PAGE,
                filteredPassingRates.length
              )}{' '}
              of {filteredPassingRates.length} results
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
      <PassingRateFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        formAction={handleFormSubmit}
        actionState={actionState}
        isPending={isMutating}
        passingRate={selectedRate} // Pass the selected rate for editing
        isEditing={isEditing}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteRate}
        title='Delete Passing Rate'
        message={`Are you sure you want to delete the passing rate for ${
          selectedRate?.program?.program || 'this program'
        } (${selectedRate?.month} ${
          selectedRate?.year
        })? This action cannot be undone.`}
      />
    </section>
  );
}
