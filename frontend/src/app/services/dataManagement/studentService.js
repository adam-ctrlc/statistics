import { fetchApi } from '../../lib/api';

// Service to handle CRUD operations for students (statistics data)
export const studentService = {
  getAll: async () => {
    try {
      const data = await fetchApi('/statistics-data');
      return { data: data.data || [], error: null, isLoading: false };
    } catch (error) {
      console.error('Error fetching statistics data:', error);
      return { data: [], error, isLoading: false };
    }
  },
  getById: async (id) => {
    try {
      const data = await fetchApi(`/statistics-data/${id}`);
      return { data: data || null, error: null, isLoading: false };
    } catch (error) {
      console.error('Error fetching statistics item:', error);
      return { data: null, error, isLoading: false };
    }
  },
  create: async (studentData) => {
    try {
      return await fetchApi('/statistics-data', {
        method: 'POST',
        body: JSON.stringify(studentData),
      });
    } catch (error) {
      console.error('Error creating statistics item:', error);
      throw error;
    }
  },
  update: async (id, studentData) => {
    try {
      return await fetchApi(`/statistics-data/${id}`, {
        method: 'PUT',
        body: JSON.stringify(studentData),
      });
    } catch (error) {
      console.error('Error updating statistics item:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      return await fetchApi(`/statistics-data/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting statistics item:', error);
      throw error;
    }
  },
  bulkDelete: async (ids) => {
    try {
      return await fetchApi('/statistics-data/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      });
    } catch (error) {
      console.error('Error bulk deleting statistics items:', error);
      throw error;
    }
  },
};
