import { fetchApi } from '../../lib/api.js';

// Service to handle CRUD operations for roles
export const roleService = {
  getAll: async () => {
    try {
      const data = await fetchApi('/role-status');
      return { data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error fetching roles:', error);
      return { data: [], error, isLoading: false };
    }
  },
  getById: async (id) => {
    try {
      const data = await fetchApi(`/role-status/${id}`);
      return { data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error fetching role:', error);
      return { data: null, error, isLoading: false };
    }
  },
  create: async (roleData) => {
    try {
      return await fetchApi('/role-status', {
        method: 'POST',
        body: JSON.stringify(roleData),
      });
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  },
  update: async (id, roleData) => {
    try {
      return await fetchApi(`/role-status/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(roleData),
      });
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      return await fetchApi(`/role-status/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  },
};
