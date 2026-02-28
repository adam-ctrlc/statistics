import { fetchApi } from '../../lib/api.js';

// Service to handle CRUD operations for regions
export const regionService = {
  getAll: async () => {
    try {
      const data = await fetchApi('/regions');
      return { data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error fetching regions:', error);
      return { data: [], error: error.message, isLoading: false };
    }
  },
  getById: async (id) => {
    try {
      const data = await fetchApi(`/regions/${id}`);
      return { data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error fetching region:', error);
      return { data: null, error: error.message, isLoading: false };
    }
  },
  create: async (regionData) => {
    try {
      return await fetchApi('/regions', {
        method: 'POST',
        body: JSON.stringify(regionData),
      });
    } catch (error) {
      console.error('Error creating region:', error);
      throw error;
    }
  },
  update: async (id, regionData) => {
    try {
      return await fetchApi(`/regions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(regionData),
      });
    } catch (error) {
      console.error('Error updating region:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      return await fetchApi(`/regions/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting region:', error);
      throw error;
    }
  },
};
