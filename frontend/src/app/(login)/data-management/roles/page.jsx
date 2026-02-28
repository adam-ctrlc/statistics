'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Users, ShieldCheck } from '@/app/components/icons';
import RoleFormModal from '../components/RoleFormModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import AlertMessage from '@/app/(login)/profile/components/AlertMessage';
import LoadingIndicator from '@/app/(login)/profile/components/LoadingIndicator';
import { roleService } from '../../../services/dataManagement/roleService';
import { userService } from '../../../services/dataManagement/userService';

export default function RoleManagement() {
  // State for data management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);

  // Modal states
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isDeleteRoleModalOpen, setIsDeleteRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // State for filters and pagination
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  const [currentRolePage, setCurrentRolePage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Stats
  const [roleStats, setRoleStats] = useState({
    total: 0,
    adminCount: 0,
    userCount: 0,
  });

  // Fetch all roles and users on mount
  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  const fetchRoles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await roleService.getAll();
      if (error) throw error;
      setRoles(data || []);
      // Calculate stats
      setRoleStats({
        total: (data || []).length,
        adminCount: (data || []).filter(
          (r) => r.role?.toLowerCase() === 'admin'
        ).length,
        userCount: (data || []).filter((r) => r.role?.toLowerCase() === 'user')
          .length,
      });
    } catch (err) {
      setError('Failed to load roles');
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await userService.getAll();
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      // Optionally handle user fetch error
    }
  };

  // Modal handlers
  const handleAddRole = () => {
    setSelectedRole(null);
    setIsEditing(false);
    setIsRoleModalOpen(true);
  };
  const handleEditRole = (role) => {
    setSelectedRole(role);
    setIsEditing(true);
    setIsRoleModalOpen(true);
  };
  const handleDeleteRoleConfirmation = (role) => {
    setSelectedRole(role);
    setIsDeleteRoleModalOpen(true);
  };

  // CRUD handlers
  const handleRoleFormSubmit = async (roleData) => {
    try {
      if (isEditing && selectedRole) {
        const updatedRole = await roleService.update(
          selectedRole._id || selectedRole.id,
          roleData
        );
        setRoles((prev) =>
          prev.map((r) => (r._id === updatedRole._id ? updatedRole : r))
        );
      } else {
        const newRole = await roleService.create(roleData);
        setRoles((prev) => [...prev, newRole]);
      }
      setIsRoleModalOpen(false);
      setSelectedRole(null);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to save role');
    }
  };
  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    try {
      await roleService.delete(selectedRole._id || selectedRole.id);
      setRoles((prev) =>
        prev.filter(
          (r) => (r._id || r.id) !== (selectedRole._id || selectedRole.id)
        )
      );
      setIsDeleteRoleModalOpen(false);
      setSelectedRole(null);
    } catch (err) {
      setError(err.message || 'Failed to delete role');
    }
  };

  // Filtering and pagination
  const filteredRoles = roles.filter((role) =>
    role.role?.toLowerCase().includes(roleSearchTerm.toLowerCase())
  );
  const indexOfLastRole = currentRolePage * itemsPerPage;
  const indexOfFirstRole = indexOfLastRole - itemsPerPage;
  const currentRoles = filteredRoles.slice(indexOfFirstRole, indexOfLastRole);
  const totalRolePages = Math.ceil(filteredRoles.length / itemsPerPage);

  // Helper to count users per role
  const getUserCountForRole = (role) => {
    return users.filter(
      (user) =>
        (user.role_id?._id || user.role_id?.id || user.role_id) ===
        (role._id || role.id)
    ).length;
  };

  return (
    <main className='role-management space-y-8'>
      {/* Error Alert */}
      {error && (
        <AlertMessage
          message={error}
          type='error'
          onDismiss={() => setError(null)}
          retryAction={fetchRoles}
        />
      )}
      {/* Loading indicator */}
      {isLoading && <LoadingIndicator />}
      {!isLoading && !error && (
        <>
          {/* Roles Management Section */}
          <section className='space-y-6'>
            <h2 className='text-2xl font-bold text-gray-800'>
              User Roles Management
            </h2>
            {/* Roles Statistics */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <article className='border border-gray-100 rounded-lg p-4 bg-white'>
                <div className='flex items-center gap-4'>
                  <div className='p-2 bg-purple-100 rounded-md'>
                    <Users
                      className='h-5 w-5 text-purple-600'
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Total Roles</p>
                    <p className='text-xl font-semibold text-gray-900'>
                      {roleStats.total}
                    </p>
                  </div>
                </div>
              </article>
              <article className='border border-gray-100 rounded-lg p-4 bg-white'>
                <div className='flex items-center gap-4'>
                  <div className='p-2 bg-blue-100 rounded-md'>
                    <ShieldCheck
                      className='h-5 w-5 text-blue-600'
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Admin Roles</p>
                    <p className='text-xl font-semibold text-gray-900'>
                      {roleStats.adminCount}
                    </p>
                  </div>
                </div>
              </article>
              <article className='border border-gray-100 rounded-lg p-4 bg-white'>
                <div className='flex items-center gap-4'>
                  <div className='p-2 bg-green-100 rounded-md'>
                    <Users
                      className='h-5 w-5 text-green-600'
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>User Roles</p>
                    <p className='text-xl font-semibold text-gray-900'>
                      {roleStats.userCount}
                    </p>
                  </div>
                </div>
              </article>
            </div>
            {/* Add Role Button & Search */}
            <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
              <div className='relative w-full md:w-64'>
                <Search
                  className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400'
                  strokeWidth={1.5}
                />
                <input
                  id='roles-search'
                  name='roles-search'
                  aria-label='Search roles'
                  type='text'
                  autoComplete='off'
                  className='w-full border border-gray-200 p-2 pl-10 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent'
                  placeholder='Search roles...'
                  value={roleSearchTerm}
                  onChange={(e) => setRoleSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={handleAddRole}
                className='inline-flex items-center gap-1.5 bg-red-700 text-white px-3 py-2 text-sm font-medium rounded-lg hover:bg-red-800 transition-colors'
              >
                <Plus className='h-4 w-4' strokeWidth={2} />
                Add Role
              </button>
            </div>
            {/* Roles Table */}
            <div className='bg-white border border-gray-100 rounded-lg overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-100'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        Role Name
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
                    {currentRoles.length > 0 ? (
                      currentRoles.map((role) => (
                        <tr
                          key={role._id || role.id}
                          className='hover:bg-gray-50 transition-colors'
                        >
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                            {role.role}
                            <span className='text-xs text-gray-500 ml-2'>
                              ({getUserCountForRole(role) || 0} user
                              {getUserCountForRole(role) === 1 ? '' : 's'} have
                              this role)
                            </span>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-right'>
                            <div className='flex justify-end gap-2'>
                              <button
                                className={`text-blue-600 hover:text-blue-800 p-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                                  role.role === 'admin' || role.role === 'user'
                                    ? 'bg-orange-50 text-orange-500 border border-orange-200 p-2 rounded-lg'
                                    : ''
                                }`}
                                onClick={() => handleEditRole(role)}
                                title={
                                  role.role === 'admin' || role.role === 'user'
                                    ? 'Default roles cannot be edited'
                                    : 'Edit Role'
                                }
                                disabled={
                                  role.role === 'admin' || role.role === 'user'
                                }
                                aria-label={
                                  role.role === 'admin' || role.role === 'user'
                                    ? 'Default roles cannot be edited'
                                    : 'Edit Role'
                                }
                              >
                                <Edit className='h-4 w-4' />
                              </button>
                              <button
                                className={`text-red-600 hover:text-red-800 p-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                                  role.role === 'admin' ||
                                  role.role === 'user' ||
                                  getUserCountForRole(role) > 0
                                    ? 'bg-orange-50 text-orange-500 border border-orange-200 p-2 rounded-lg'
                                    : ''
                                }`}
                                onClick={() =>
                                  handleDeleteRoleConfirmation(role)
                                }
                                disabled={
                                  role.role === 'admin' ||
                                  role.role === 'user' ||
                                  getUserCountForRole(role) > 0
                                }
                                title={
                                  role.role === 'admin' || role.role === 'user'
                                    ? 'Default roles cannot be deleted'
                                    : getUserCountForRole(role) > 0
                                    ? 'Cannot delete: role is in use'
                                    : 'Delete Role'
                                }
                                aria-label={
                                  role.role === 'admin' || role.role === 'user'
                                    ? 'Default roles cannot be deleted'
                                    : getUserCountForRole(role) > 0
                                    ? 'Cannot delete: role is in use'
                                    : 'Delete Role'
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
                          colSpan='2'
                          className='px-6 py-4 text-center text-sm text-gray-500'
                        >
                          No roles found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {totalRolePages > 1 && (
                <div className='p-4 border-t border-gray-100 flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>
                    Page {currentRolePage} of {totalRolePages} (
                    {filteredRoles.length} results)
                  </span>
                  <div className='flex gap-1'>
                    <button
                      className='px-3 py-1 border border-gray-200 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                      disabled={currentRolePage === 1}
                      onClick={() =>
                        setCurrentRolePage((prev) => Math.max(prev - 1, 1))
                      }
                    >
                      Previous
                    </button>
                    <button
                      className='px-3 py-1 border border-gray-200 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                      disabled={currentRolePage >= totalRolePages}
                      onClick={() =>
                        setCurrentRolePage((prev) =>
                          Math.min(prev + 1, totalRolePages)
                        )
                      }
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
          {/* Role Form Modal */}
          <RoleFormModal
            isOpen={isRoleModalOpen}
            onClose={() => {
              setIsRoleModalOpen(false);
              setSelectedRole(null);
              setIsEditing(false);
            }}
            onSubmit={handleRoleFormSubmit}
            role={selectedRole}
            isEditing={isEditing}
          />
          {/* Delete Role Confirmation Modal */}
          <DeleteConfirmationModal
            isOpen={isDeleteRoleModalOpen}
            onClose={() => setIsDeleteRoleModalOpen(false)}
            onConfirm={handleDeleteRole}
            title='Delete Role'
            message={
              selectedRole
                ? `Are you sure you want to delete the role "${selectedRole.role}"? This action cannot be undone.`
                : ''
            }
          />
        </>
      )}
    </main>
  );
}
