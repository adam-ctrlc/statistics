'use client';

import { useState, useEffect, useMemo, startTransition } from 'react';
import { departmentService } from '../../../services/dataManagement/departmentService';
import { programService } from '../../../services/dataManagement/programService';
import DepartmentFormModal from '../components/DepartmentFormModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import {
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Building,
  Filter,
  X,
  BookCopy,
} from '@/app/components/icons';
import AlertMessage from '@/app/(login)/profile/components/AlertMessage';
import LoadingIndicator from '@/app/(login)/profile/components/LoadingIndicator';
import Loading from '@/app/components/Loading';

const ITEMS_PER_PAGE = 10;
const initialAddEditState = { type: null, message: null };

export default function DepartmentsManagement() {
  // Data State
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [deleteState, setDeleteState] = useState({
    loading: false,
    error: null,
    success: null,
  });
  const [programs, setPrograms] = useState([]);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Action States for Add/Edit Forms
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // --- Data Fetching ---
  const loadData = async () => {
    startTransition(() => {
      setIsLoading(true);
      setFetchError(null);
    });
    try {
      const { data, error, isLoading } = await departmentService.getAll();
      if (error) throw error;
      setDepartments(data || []);
      setIsLoading(isLoading);
    } catch (err) {
      console.error('Error loading department data:', err);
      setFetchError(err.message || 'Failed to load departments.');
      setDepartments([]);
    } finally {
      startTransition(() => {
        setIsLoading(false);
      });
    }
  };

  const fetchPrograms = async () => {
    try {
      const { data } = await programService.getAll();
      setPrograms(Array.isArray(data) ? data : []);
    } catch {}
  };

  useEffect(() => {
    loadData();
    fetchPrograms();
  }, []);

  // --- Modal Handling ---
  const handleAddDepartment = () => {
    setSelectedDepartment(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditDepartment = async (dept) => {
    setIsEditing(true);
    setSelectedDepartment(null);
    setIsModalLoading(true);
    try {
      const { data, error } = await departmentService.getById(
        dept._id || dept.id
      );
      if (error) throw error;
      setSelectedDepartment(data);
      setIsModalOpen(true);
      setIsModalLoading(false);
    } catch (err) {
      setFetchError(err.message || 'Failed to fetch department data');
      setIsEditing(false);
      setIsModalLoading(false);
    }
  };

  const handleDeleteDepartment = (dept) => {
    setSelectedDepartment(dept);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDepartment(null);
  };

  // --- Add/Edit Handlers (no useActionState) ---
  const handleAddDepartmentSubmit = async (data) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      const newDepartment = await departmentService.create(data);
      setDepartments((prev) => [...prev, newDepartment]);
      setActionSuccess('Department created successfully');
      setIsModalOpen(false);
    } catch (error) {
      setActionError(error.message || 'Failed to create department');
    }
  };

  const handleUpdateDepartmentSubmit = async (data) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      const updatedDepartment = await departmentService.update(data.id, {
        name: data.name,
      });
      setDepartments((prev) =>
        prev.map((dept) => (dept._id === data.id ? updatedDepartment : dept))
      );
      setActionSuccess('Department updated successfully');
      setIsModalOpen(false);
    } catch (error) {
      setActionError(error.message || 'Failed to update department');
    }
  };

  // --- Deletion Handling ---
  const confirmDeleteDepartment = async () => {
    if (!selectedDepartment) return;
    setDeleteState({ loading: true, error: null, success: null });
    try {
      await departmentService.delete(selectedDepartment._id);
      setDeleteState({
        loading: false,
        error: null,
        success: 'Department deleted successfully',
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
      setSelectedDepartment(null);
      setTimeout(
        () => setDeleteState({ loading: false, error: null, success: null }),
        3000
      );
    }
  };

  // --- Filtering & Pagination ---
  const filteredDepartments = useMemo(() => {
    return (departments || []).filter((dept) => {
      return (
        searchTerm === '' ||
        dept.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [departments, searchTerm]);

  const totalPages = Math.ceil(filteredDepartments.length / ITEMS_PER_PAGE);
  const currentDepartments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDepartments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredDepartments, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const hasActiveFilters = !!searchTerm;

  // --- Stats Calculation (Simple count for now) ---
  const departmentStats = useMemo(
    () => ({ total: departments.length }),
    [departments]
  );

  // Helper to check if a department is in use
  const isDepartmentInUse = (deptId) => {
    return (
      Array.isArray(programs) &&
      programs.some(
        (p) =>
          (p.department_id?._id || p.department_id?.id || p.department_id) ===
          (deptId._id || deptId.id)
      )
    );
  };

  return (
    <section className='space-y-6'>
      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='bg-white border border-gray-100 rounded-lg p-4 flex items-center gap-4'>
          <div className='p-2 bg-cyan-100 rounded-md'>
            <Building className='h-5 w-5 text-cyan-600' strokeWidth={1.5} />
          </div>
          <div>
            <p className='text-sm text-gray-500'>Total Departments</p>
            <p className='text-xl font-semibold text-gray-900'>
              {departmentStats.total}
            </p>
          </div>
        </div>
        {/* Add another relevant stat card if needed */}
        {/* <div className="bg-white border border-gray-100 rounded-lg p-4">...</div> */}
      </div>

      {/* Action/Error Display Area */}
      {(fetchError || actionError || actionSuccess || deleteState.error || deleteState.success) && (
        <div className="min-h-[40px]">
          {fetchError && <AlertMessage message={fetchError} type='error' />}
          {actionError && <AlertMessage message={actionError} type='error' />}
          {actionSuccess && (
            <AlertMessage message={actionSuccess} type='success' />
          )}
          {deleteState.error && (
            <AlertMessage message={deleteState.error} type='error' />
          )}
          {deleteState.success && (
            <AlertMessage message={deleteState.success} type='success' />
          )}
        </div>
      )}

      {/* Table Section */}
      <div className='bg-white border border-gray-100 rounded-lg'>
        <div className='flex flex-col md:flex-row justify-between items-center gap-4 p-4 border-b border-gray-100'>
          {/* Search Input */}
          <div className='relative w-full md:w-64'>
            <Search
              className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400'
              strokeWidth={1.5}
            />
            <input
              id='departments-search'
              name='departments-search'
              aria-label='Search departments'
              type='text'
              autoComplete='off'
              placeholder='Search department...'
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className='w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent'
            />
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-red-600'
                title='Clear Search'
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
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
            </button>
            <button
              onClick={handleAddDepartment}
              className='inline-flex items-center gap-1.5 bg-red-700 text-white px-3 py-2 text-sm font-medium rounded-lg hover:bg-red-800 transition-colors'
            >
              <Plus className='h-4 w-4' strokeWidth={2} />
              Add Department
            </button>
          </div>
        </div>

        {/* Table */}
        <div className='overflow-x-auto'>
          {isLoading ? (
            <LoadingIndicator />
          ) : currentDepartments.length > 0 ? (
            <table className='min-w-full divide-y divide-gray-100'>
              <thead className='bg-gray-50'>
                <tr>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Department Name
                  </th>
                  {/* Add more columns if needed, e.g., Program Count */}
                  <th
                    scope='col'
                    className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-100'>
                {currentDepartments.map((dept) => (
                  <tr key={dept._id}>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      {dept.name}
                    </td>
                    {/* Render data for additional columns here */}
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2'>
                      <button
                        onClick={() => handleEditDepartment(dept)}
                        className='text-blue-600 hover:text-blue-800 p-1 disabled:opacity-50'
                        title='Edit Department'
                      >
                        <Edit className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(dept)}
                        className={`text-red-600 hover:text-red-800 p-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                          isDepartmentInUse(dept)
                            ? 'bg-orange-50 text-orange-500 border border-orange-200 p-2 rounded-lg'
                            : ''
                        }`}
                        title={
                          isDepartmentInUse(dept)
                            ? 'Cannot delete: department is in use'
                            : 'Delete Department'
                        }
                        aria-label={
                          isDepartmentInUse(dept)
                            ? 'Cannot delete: department is in use'
                            : 'Delete Department'
                        }
                        disabled={isDepartmentInUse(dept)}
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
              {searchTerm
                ? 'No departments found matching your search.'
                : 'No departments created yet. Click "Add Department" to start.'}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && !isLoading && (
          <div className='p-4 border-t border-gray-100 flex items-center justify-between'>
            <span className='text-sm text-gray-600'>
              Showing
              {filteredDepartments.length > 0
                ? (currentPage - 1) * ITEMS_PER_PAGE + 1
                : 0}
              -{' '}
              {Math.min(
                currentPage * ITEMS_PER_PAGE,
                filteredDepartments.length
              )}{' '}
              of {filteredDepartments.length} results
            </span>
            <div className='flex gap-1'>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className='px-3 py-1 border border-gray-200 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50'
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className='px-3 py-1 border border-gray-200 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50'
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <DepartmentFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        formAction={
          isEditing ? handleUpdateDepartmentSubmit : handleAddDepartmentSubmit
        }
        actionState={
          actionError
            ? { type: 'error', message: actionError }
            : actionSuccess
            ? { type: 'success', message: actionSuccess }
            : null
        }
        department={selectedDepartment}
        isEditing={isEditing}
        loading={isModalLoading && isEditing}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteDepartment}
        title='Delete Department'
        message={`Are you sure you want to delete department '${selectedDepartment?.name}'? This action cannot be undone. Note: Deletion might fail if programs are associated with this department.`}
      />
    </section>
  );
}
