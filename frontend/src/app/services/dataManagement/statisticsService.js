import { fetchApi } from '../../lib/api.js';

// Service to handle CRUD operations for statistics
export const statisticsService = {
  getAll: async () => {
    try {
      const data = await fetchApi('/statistics-data');
      return { data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return { data: [], error: error.message, isLoading: false };
    }
  },
  getById: async (id) => {
    try {
      const data = await fetchApi(`/statistics-data/${id}`);
      return { data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error fetching statistic:', error);
      return { data: null, error: error.message, isLoading: false };
    }
  },
  create: async (statisticsData) => {
    try {
      return await fetchApi('/statistics-data', {
        method: 'POST',
        body: JSON.stringify(statisticsData),
      });
    } catch (error) {
      console.error('Error creating statistics:', error);
      throw error;
    }
  },
  update: async (id, statisticsData) => {
    try {
      return await fetchApi(`/statistics-data/${id}`, {
        method: 'PUT',
        body: JSON.stringify(statisticsData),
      });
    } catch (error) {
      console.error('Error updating statistics:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      return await fetchApi(`/statistics-data/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting statistics:', error);
      throw error;
    }
  },
};
