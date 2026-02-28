import { fetchApi } from '../../lib/api.js';

// Service to handle CRUD operations for departments
export const departmentService = {
  getAll: async () => {
    try {
      const data = await fetchApi('/departments');
      return { data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error fetching departments:', error);
      return { data: [], error, isLoading: false };
    }
  },
  getById: async (id) => {
    try {
      const data = await fetchApi(`/departments/${id}`);
      return { data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error fetching department:', error);
      return { data: null, error, isLoading: false };
    }
  },
  create: async (departmentData) => {
    try {
      return await fetchApi('/departments', {
        method: 'POST',
        body: JSON.stringify(departmentData),
      });
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  },
  update: async (id, departmentData) => {
    try {
      return await fetchApi(`/departments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(departmentData),
      });
    } catch (error) {
      console.error('Error updating department:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      return await fetchApi(`/departments/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting department:', error);
      throw error;
    }
  },
};
