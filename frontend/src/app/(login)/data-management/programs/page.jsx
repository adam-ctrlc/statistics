'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  BookCopy,
  Building,
  X,
} from '@/app/components/icons';
import AlertMessage from '@/app/(login)/profile/components/AlertMessage';
import LoadingIndicator from '@/app/(login)/profile/components/LoadingIndicator';
import CustomSelect from '@/app/components/CustomSelect';
import ProgramFormModal from '../components/ProgramFormModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { programService } from '../../../services/dataManagement/programService';
import { statisticsService } from '../../../services/dataManagement/statisticsService';
import { userService } from '../../../services/dataManagement/userService';
import { nationalPassingRateService } from '../../../services/dataManagement/nationalPassingRateService';

const ITEMS_PER_PAGE = 10;

export default function ProgramsManagement() {
  // Data State
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  // Track usage
  const [statistics, setStatistics] = useState([]);
  const [users, setUsers] = useState([]);
  const [nprs, setNprs] = useState([]);
  const [programsLoaded, setProgramsLoaded] = useState(false);
  const [usageLoaded, setUsageLoaded] = useState(false);

  // Modal States
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Load data on component mount
  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await programService.getAll();
      if (error) throw error;
      setPrograms(data || []);
      const deptMap = {};
      (data || []).forEach((program) => {
        if (
          program.department_id &&
          typeof program.department_id === 'object'
        ) {
          deptMap[program.department_id._id] = program.department_id;
        } else if (program.department_id) {
          deptMap[program.department_id] = {
            _id: program.department_id,
            department: `Department ID: ${program.department_id}`,
            name: `Department ID: ${program.department_id}`,
          };
        }
      });
      const extractedDepts = Object.values(deptMap);
      setDepartments(extractedDepts);
      setProgramsLoaded(true);
    } catch (err) {
      console.error('Error loading program data:', err);
      setFetchError(
        err.message || 'An unexpected error occurred while loading data.'
      );
      setPrograms([]);
      setDepartments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!programsLoaded) return;
    setUsageLoaded(false);
    Promise.all([
      statisticsService.getAll(),
      userService.getAll(),
      nationalPassingRateService.getAll(),
    ]).then(([statisticsRes, usersRes, nprRes]) => {
      setStatistics(
        Array.isArray(statisticsRes.data)
          ? statisticsRes.data
          : statisticsRes.data?.data || []
      );
      setUsers(usersRes.data || []);
      setNprs(nprRes.data || []);
      setUsageLoaded(true);
    });
  }, [programsLoaded]);

  const allLoaded = programsLoaded && usageLoaded && !isLoading;

  // Compute usage
  const programUsage = useMemo(() => {
    const safeStatistics = Array.isArray(statistics) ? statistics : [];
    const safeUsers = Array.isArray(users) ? users : [];
    const safeNprs = Array.isArray(nprs) ? nprs : [];
    const usage = {};
    programs.forEach((program) => {
      const id = program._id?.toString();
      const name = program.program;
      const statMatch = safeStatistics.some((s) => {
        const statPid = s.program_id?._id
          ? s.program_id._id.toString()
          : s.program_id?.toString?.() || s.program_id;
        if (statPid === id) {
          console.log('STATISTICS MATCH:', { statPid, name, program, s });
        }
        return statPid === id;
      });
      const userMatch = safeUsers.some((u) => {
        const userPid = u.program_id?._id
          ? u.program_id._id.toString()
          : u.program_id?.toString?.() || u.program_id;
        if (userPid === id) {
          console.log('USER MATCH:', { userPid, name, program, u });
        }
        return userPid === id;
      });
      usage[id] = statMatch || userMatch;
    });
    console.log('Final programUsage:', usage);
    return usage;
  }, [programs, statistics, users, nprs]);

  // Modal Handling
  const handleAddProgram = () => {
    setSelectedProgram(null);
    setIsEditing(false);
    setIsProgramModalOpen(true);
  };

  const handleEditProgram = (program) => {
    setSelectedProgram(program);
    setIsEditing(true);
    setIsProgramModalOpen(true);
  };

  const handleDeleteProgram = (program) => {
    setSelectedProgram(program);
    setIsDeleteModalOpen(true);
  };

  const handleCloseProgramModal = () => {
    setIsProgramModalOpen(false);
    setSelectedProgram(null);
    setActionError(null);
    setActionSuccess(null);
  };

  // CRUD Operations using service
  const handleCreate = async (programData) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      const newProgram = await programService.create(programData);
      setPrograms([...programs, newProgram]);
      setActionSuccess('Program created successfully.');
      setIsProgramModalOpen(false);
    } catch (error) {
      console.error('Failed to create program:', error);
      setActionError(error.message || 'Failed to create program.');
    }
  };

  const handleUpdate = async (programData) => {
    setActionError(null);
    setActionSuccess(null);
    if (!selectedProgram) return;
    try {
      const updatedProgram = await programService.update(
        selectedProgram._id,
        programData
      );
      setPrograms(
        programs.map((program) =>
          program._id === selectedProgram._id ? updatedProgram : program
        )
      );
      setActionSuccess('Program updated successfully.');
      setIsProgramModalOpen(false);
    } catch (error) {
      console.error('Failed to update program:', error);
      setActionError(error.message || 'Failed to update program.');
    }
  };

  // Helper: Check if a program is in use
  const isProgramInUse = (programId) => !!programUsage[programId?.toString()];

  const confirmDeleteProgram = async () => {
    if (!selectedProgram) return;
    if (isProgramInUse(selectedProgram._id)) {
      setActionError('Cannot delete: program is in use.');
      setIsDeleteModalOpen(false);
      setSelectedProgram(null);
      return;
    }
    try {
      await programService.delete(selectedProgram._id);
      setPrograms(
        programs.filter((program) => program._id !== selectedProgram._id)
      );
      setActionSuccess('Program deleted successfully.');
    } catch (error) {
      console.error('Failed to delete program:', error);
      setActionError(error.message || 'Failed to delete program.');
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedProgram(null);
      setTimeout(() => {
        setActionError(null);
        setActionSuccess(null);
      }, 3000);
    }
  };

  // Filtering & Pagination
  const filteredPrograms = useMemo(() => {
    return (programs || []).filter((program) => {
      const searchMatch =
        searchTerm === '' ||
        program.program.toLowerCase().includes(searchTerm.toLowerCase());
      const departmentMatch =
        departmentFilter === '' ||
        (program.department_id &&
          program.department_id._id &&
          program.department_id._id.toString() === departmentFilter);
      return searchMatch && departmentMatch;
    });
  }, [programs, searchTerm, departmentFilter]);

  const totalPages = Math.ceil(filteredPrograms.length / ITEMS_PER_PAGE);
  const currentPrograms = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPrograms.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPrograms, currentPage]);

  const handlePageChange = (page) => setCurrentPage(page);

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || departmentFilter;

  // Stats Calculation
  const programStats = useMemo(() => {
    const byDepartment = {};
    departments.forEach((dept) => {
      byDepartment[dept._id] = {
        name: dept.department || dept.name || 'Unnamed Department',
        count: programs.filter(
          (p) => p.department_id && p.department_id._id === dept._id
        ).length,
      };
    });
    return {
      total: programs.length,
      byDepartment,
    };
  }, [programs, departments]);

  return (
    <section className='space-y-6'>
      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='bg-white border border-gray-100 rounded-lg p-4 flex items-center gap-4'>
          <div className='p-2 bg-blue-100 rounded-md'>
            <BookCopy className='h-5 w-5 text-blue-600' strokeWidth={1.5} />
          </div>
          <div>
            <p className='text-sm text-gray-500'>Total Programs</p>
            <p className='text-xl font-semibold text-gray-900'>
              {programStats.total}
            </p>
          </div>
        </div>
        <div className='bg-white border border-gray-100 rounded-lg p-4'>
          <div className='flex items-center gap-4 mb-2'>
            <div className='p-2 bg-green-100 rounded-md'>
              <Building className='h-5 w-5 text-green-600' strokeWidth={1.5} />
            </div>
            <p className='text-sm text-gray-500'>Programs by Department</p>
          </div>
          <div className='text-sm space-y-1 max-h-24 overflow-y-auto px-1'>
            {Object.values(programStats.byDepartment).map((dept) => (
              <div key={dept.name} className='flex justify-between'>
                <span className='text-gray-700'>{dept.name}:</span>
                <span className='font-medium text-gray-800'>{dept.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action/Error Display Area */}
      {(fetchError || actionError || actionSuccess) && (
        <div className='min-h-[40px]'>
          {fetchError && <AlertMessage message={fetchError} type='error' />}
          {actionError && <AlertMessage message={actionError} type='error' />}
          {actionSuccess && (
            <AlertMessage message={actionSuccess} type='success' />
          )}
        </div>
      )}

      {/* Table Section */}
      <div className='bg-white border border-gray-100 rounded-lg'>
        {allLoaded ? (
          <>
            <div className='flex flex-col md:flex-row justify-between items-center gap-4 p-4 border-b border-gray-100'>
              <div className='relative w-full md:w-64'>
                <Search
                  className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400'
                  strokeWidth={1.5}
                />
                <input
                  id='programs-search'
                  name='programs-search'
                  aria-label='Search programs'
                  type='text'
                  autoComplete='off'
                  placeholder='Search program...'
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className='w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent'
                />
              </div>
              <div className='flex flex-wrap items-center gap-2'>
                <CustomSelect
                  id='department-filter'
                  value={departmentFilter}
                  onChange={(e) => {
                    setDepartmentFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: '', label: 'All Departments' },
                    ...(departments.map((d) => ({
                      value: d._id.toString(),
                      label: d.department || d.name || 'Unnamed Department',
                    })) || []),
                  ]}
                  placeholder='All Departments'
                  className='w-40'
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
                  onClick={handleAddProgram}
                  className='inline-flex items-center gap-1.5 bg-red-700 text-white px-3 py-2 text-sm font-medium rounded-lg hover:bg-red-800 transition-colors'
                >
                  <Plus className='h-4 w-4' strokeWidth={2} />
                  Add Program
                </button>
              </div>
            </div>

            {/* Table */}
            <div className='overflow-x-auto'>
              {isLoading ? (
                <LoadingIndicator />
              ) : currentPrograms.length > 0 ? (
                <table className='min-w-full divide-y divide-gray-100'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        Program Name
                      </th>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        Department
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
                    {currentPrograms.map((program) => (
                      <tr key={program._id}>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                          {program.program}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {program.department_id
                            ? typeof program.department_id === 'object'
                              ? program.department_id.department ||
                                program.department_id.name ||
                                'N/A'
                              : `Department ID: ${program.department_id}`
                            : 'N/A'}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2'>
                          <button
                            onClick={() => handleEditProgram(program)}
                            className='text-blue-600 hover:text-blue-800 p-1 disabled:opacity-50'
                            title='Edit Program'
                            disabled={isLoading}
                          >
                            <Edit className='h-4 w-4' />
                          </button>
                          <button
                            onClick={() => handleDeleteProgram(program)}
                            className={`text-red-600 hover:text-red-800 p-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                              isProgramInUse(program._id)
                                ? 'bg-orange-50 text-orange-500 border border-orange-200 p-2 rounded-lg'
                                : ''
                            }`}
                            title={
                              isProgramInUse(program._id)
                                ? 'Cannot delete: program is in use'
                                : 'Delete Program'
                            }
                            aria-label={
                              isProgramInUse(program._id)
                                ? 'Cannot delete: program is in use'
                                : 'Delete Program'
                            }
                            disabled={isLoading || isProgramInUse(program._id)}
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
                  <p>No programs found matching your criteria.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && !isLoading && (
              <div className='p-4 border-t border-gray-100 flex items-center justify-between'>
                <span className='text-sm text-gray-600'>
                  Page {currentPage} of {totalPages}
                </span>
                <div className='flex gap-1'>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                    className='px-3 py-1 border border-gray-200 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50'
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                    className='px-3 py-1 border border-gray-200 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50'
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <LoadingIndicator />
        )}
      </div>

      {/* Modals */}
      <ProgramFormModal
        isOpen={isProgramModalOpen}
        onClose={handleCloseProgramModal}
        formAction={isEditing ? handleUpdate : handleCreate}
        actionState={
          actionError
            ? { type: 'error', message: actionError }
            : actionSuccess
            ? { type: 'success', message: actionSuccess }
            : null
        }
        program={selectedProgram}
        isEditing={isEditing}
        departments={departments}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteProgram}
        title='Delete Program'
        message={`Are you sure you want to delete program '${
          selectedProgram?.program || 'Unknown'
        }'? This action cannot be undone.`}
      />
    </section>
  );
}
