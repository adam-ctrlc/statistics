import { fetchApi } from '../../lib/api';

// Service to handle CRUD operations for passing rates
export const passingRateService = {
  getAll: async () => {
    try {
      const data = await fetchApi('/national-passing-rates');
      return { data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error fetching passing rates:', error);
      return { data: [], error, isLoading: false };
    }
  },
  getById: async (id) => {
    try {
      const data = await fetchApi(`/national-passing-rates/${id}`);
      return { data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error fetching passing rate:', error);
      return { data: null, error, isLoading: false };
    }
  },
  create: async (passingRateData) => {
    try {
      return await fetchApi('/national-passing-rates', {
        method: 'POST',
        body: JSON.stringify(passingRateData),
      });
    } catch (error) {
      console.error('Error creating passing rate:', error);
      throw error;
    }
  },
  update: async (id, passingRateData) => {
    try {
      return await fetchApi(`/national-passing-rates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(passingRateData),
      });
    } catch (error) {
      console.error('Error updating passing rate:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      return await fetchApi(`/national-passing-rates/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting passing rate:', error);
      throw error;
    }
  },
};
