import { fetchApi } from '../../lib/api.js';

// Service to handle CRUD operations for schools
export const schoolService = {
  getAll: async () => {
    try {
      const data = await fetchApi('/schools');
      return { data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error fetching schools:', error);
      return { data: [], error, isLoading: false };
    }
  },
  getById: async (id) => {
    try {
      const data = await fetchApi(`/schools/${id}`);
      return { data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error fetching school:', error);
      return { data: null, error, isLoading: false };
    }
  },
  create: async (schoolData) => {
    try {
      return await fetchApi('/schools', {
        method: 'POST',
        body: JSON.stringify(schoolData),
      });
    } catch (error) {
      console.error('Error creating school:', error);
      throw error;
    }
  },
  update: async (id, schoolData) => {
    try {
      return await fetchApi(`/schools/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(schoolData),
      });
    } catch (error) {
      console.error('Error updating school:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      return await fetchApi(`/schools/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting school:', error);
      throw error;
    }
  },
};
