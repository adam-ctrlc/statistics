import { fetchApi } from '../../lib/api.js';

// Service to handle CRUD operations for national passing rates
export const nationalPassingRateService = {
  getAll: async () => {
    try {
      const data = await fetchApi('/national-passing-rates');
      return { data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error fetching national passing rates:', error);
      return { data: [], error, isLoading: false };
    }
  },
  getById: async (id) => {
    try {
      const data = await fetchApi(`/national-passing-rates/${id}`);
      return { data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error fetching national passing rate:', error);
      return { data: null, error, isLoading: false };
    }
  },
  create: async (nationalPassingRateData) => {
    try {
      return await fetchApi('/national-passing-rates', {
        method: 'POST',
        body: JSON.stringify(nationalPassingRateData),
      });
    } catch (error) {
      console.error('Error creating national passing rate:', error);
      throw error;
    }
  },
  update: async (id, nationalPassingRateData) => {
    try {
      return await fetchApi(`/national-passing-rates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(nationalPassingRateData),
      });
    } catch (error) {
      console.error('Error updating national passing rate:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      return await fetchApi(`/national-passing-rates/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting national passing rate:', error);
      throw error;
    }
  },
};
