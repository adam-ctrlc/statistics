'use client';
import React, { useState, useEffect } from 'react';
import RegionFormModal from '../components/RegionFormModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { regionService } from '../../../services/dataManagement/regionService';
import { schoolService } from '../../../services/dataManagement/schoolService';
import AlertMessage from '@/app/(login)/profile/components/AlertMessage';
import LoadingIndicator from '@/app/(login)/profile/components/LoadingIndicator';
import { Plus, Search, Edit, Trash2 } from '@/app/components/icons';

export default function RegionsManagement() {
  // State for data management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regions, setRegions] = useState([]);
  const [schools, setSchools] = useState([]);

  // Modal states
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Stats
  const [regionStats, setRegionStats] = useState({
    total: 0,
    schoolCounts: {},
  });

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch regions and schools from backend
  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [regionsRes, schoolsRes] = await Promise.all([
        regionService.getAll(),
        schoolService.getAll(),
      ]);
      if (regionsRes.error) throw regionsRes.error;
      if (schoolsRes.error) throw schoolsRes.error;
      const regionsData = regionsRes.data || [];
      const schoolsData = schoolsRes.data || [];
      setRegions(regionsData);
      setSchools(schoolsData);
      // Calculate stats
      const totalRegions = regionsData.length;
      const schoolCounts = {};
      regionsData.forEach((region) => {
        const regionId = region._id || region.id;
        const count = schoolsData.filter(
          (school) =>
            (school.region_id?._id ||
              school.region_id?.id ||
              school.region_id) === regionId
        ).length;
        schoolCounts[regionId] = count;
      });
      setRegionStats({
        total: totalRegions,
        schoolCounts,
      });
    } catch (err) {
      setError(err.message || 'Failed to load regions or schools');
      setRegions([]);
      setSchools([]);
      setRegionStats({ total: 0, schoolCounts: {} });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle opening region modal for creating a new region
  const handleAddRegion = () => {
    setSelectedRegion(null);
    setIsEditing(false);
    setIsRegionModalOpen(true);
  };

  // Function to handle region edit
  const handleEdit = (region) => {
    setSelectedRegion(region);
    setIsEditing(true);
    setIsRegionModalOpen(true);
  };

  // Function to handle delete confirmation
  const handleDeleteConfirmation = (region) => {
    setSelectedRegion(region);
    setIsDeleteModalOpen(true);
  };

  // Function to handle region deletion
  const handleDeleteRegion = async () => {
    if (!selectedRegion) return;
    setIsLoading(true);
    setError(null);
    try {
      await regionService.delete(selectedRegion._id || selectedRegion.id);
      setRegions((prev) =>
        prev.filter(
          (r) => (r._id || r.id) !== (selectedRegion._id || selectedRegion.id)
        )
      );
      setIsDeleteModalOpen(false);
      setSelectedRegion(null);
      fetchAllData();
    } catch (err) {
      setError(err.message || 'Failed to delete region');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle form submission from modal
  const handleRegionFormSubmit = async (regionData) => {
    setError(null);
    try {
      if (isEditing && selectedRegion) {
        const updatedRegion = await regionService.update(
          selectedRegion._id || selectedRegion.id,
          regionData
        );
        setRegions((prev) =>
          prev.map((r) => (r._id === updatedRegion._id ? updatedRegion : r))
        );
      } else {
        const newRegion = await regionService.create(regionData);
        setRegions((prev) => [...prev, newRegion]);
      }
      setIsRegionModalOpen(false);
      setSelectedRegion(null);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to save region');
    }
  };

  // Filtering and pagination
  const filteredRegions = regions.filter((region) =>
    region.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLastRegion = currentPage * itemsPerPage;
  const indexOfFirstRegion = indexOfLastRegion - itemsPerPage;
  const currentRegions = filteredRegions.slice(
    indexOfFirstRegion,
    indexOfLastRegion
  );
  const totalPages = Math.ceil(filteredRegions.length / itemsPerPage);

  // Helper to count schools per region
  const getSchoolCountForRegion = (region) => {
    const regionId = region._id || region.id;
    return schools.filter(
      (school) =>
        (school.region_id?._id || school.region_id?.id || school.region_id) ===
        regionId
    ).length;
  };

  return (
    <main className='region-management space-y-8'>
      {/* Error Alert */}
      {error && <AlertMessage message={error} type='error' />}
      {/* Loading indicator */}
      {isLoading && <LoadingIndicator />}
      {!isLoading && !error && (
        <>
          {/* Regions Management Section */}
          <section className='space-y-6'>
            <h2 className='text-2xl font-bold text-gray-800'>
              Regions Management
            </h2>
            {/* Regions Statistics */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <article className='border border-gray-100 rounded-lg p-4 bg-white'>
                <div className='flex items-center gap-4'>
                  <div className='p-2 bg-purple-100 rounded-md'>
                    <span className='font-bold text-purple-600 text-xl'>R</span>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Total Regions</p>
                    <p className='text-xl font-semibold text-gray-900'>
                      {regionStats.total}
                    </p>
                  </div>
                </div>
              </article>
            </div>
            {/* Add Region Button & Search */}
            <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
              <div className='relative w-full md:w-64'>
                <Search
                  className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400'
                  strokeWidth={1.5}
                />
                <input
                  id='regions-search'
                  name='regions-search'
                  aria-label='Search regions'
                  type='text'
                  autoComplete='off'
                  className='w-full border border-gray-200 p-2 pl-10 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent'
                  placeholder='Search regions...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={handleAddRegion}
                className='inline-flex items-center gap-1.5 bg-red-700 text-white px-3 py-2 text-sm font-medium rounded-lg hover:bg-red-800 transition-colors'
              >
                <Plus className='h-4 w-4' strokeWidth={2} />
                Add Region
              </button>
            </div>
            {/* Regions Table */}
            <div className='bg-white border border-gray-100 rounded-lg overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-100'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Region Name
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Schools Count
                      </th>
                      <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-100'>
                    {currentRegions.length > 0 ? (
                      currentRegions.map((region) => (
                        <tr
                          key={region._id || region.id}
                          className='hover:bg-gray-50 transition-colors'
                        >
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                            {region.name}
                            <span className='text-xs text-gray-500 ml-2'>
                              ({getSchoolCountForRegion(region) || 0} school
                              {getSchoolCountForRegion(region) === 1 ? '' : 's'}
                              )
                            </span>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                            {getSchoolCountForRegion(region) || 0}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-right'>
                            <div className='flex justify-end gap-2'>
                              <button
                                className='text-blue-600 hover:text-blue-800 p-1 disabled:opacity-50 disabled:cursor-not-allowed'
                                onClick={() => handleEdit(region)}
                                title='Edit Region'
                              >
                                <Edit className='h-4 w-4' />
                              </button>
                              <button
                                className={`text-red-600 hover:text-red-800 p-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                                  getSchoolCountForRegion(region) > 0
                                    ? 'bg-orange-50 text-orange-500 border border-orange-200 p-2 rounded-lg'
                                    : ''
                                }`}
                                onClick={() => handleDeleteConfirmation(region)}
                                disabled={getSchoolCountForRegion(region) > 0}
                                aria-label={
                                  getSchoolCountForRegion(region) > 0
                                    ? 'Cannot delete: region has schools'
                                    : 'Delete Region'
                                }
                                title={
                                  getSchoolCountForRegion(region) > 0
                                    ? 'Cannot delete: region has schools'
                                    : 'Delete Region'
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
                          colSpan='3'
                          className='px-6 py-4 text-center text-sm text-gray-500'
                        >
                          No regions found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className='p-4 border-t border-gray-100 flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>
                    Page {currentPage} of {totalPages} ({filteredRegions.length}{' '}
                    results)
                  </span>
                  <div className='flex gap-1'>
                    <button
                      className='px-3 py-1 border border-gray-200 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                    >
                      Previous
                    </button>
                    <button
                      className='px-3 py-1 border border-gray-200 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
          {/* Region Form Modal */}
          <RegionFormModal
            isOpen={isRegionModalOpen}
            onClose={() => {
              setIsRegionModalOpen(false);
              setSelectedRegion(null);
              setIsEditing(false);
            }}
            onSubmit={handleRegionFormSubmit}
            region={selectedRegion}
            isEditing={isEditing}
          />
          {/* Delete Confirmation Modal */}
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteRegion}
            title='Delete Region'
            message={
              selectedRegion
                ? `Are you sure you want to delete the region "${selectedRegion.name}"? This action cannot be undone.`
                : ''
            }
          />
        </>
      )}
    </main>
  );
}
