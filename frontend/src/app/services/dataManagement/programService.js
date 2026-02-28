import { fetchApi } from '../../lib/api.js';

// Service to handle CRUD operations for programs
export const programService = {
  getAll: async () => {
    try {
      const data = await fetchApi('/programs');
      return { data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error fetching programs:', error);
      return { data: [], error, isLoading: false };
    }
  },
  getById: async (id) => {
    try {
      const data = await fetchApi(`/programs/${id}`);
      return { data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error fetching program:', error);
      return { data: null, error, isLoading: false };
    }
  },
  create: async (programData) => {
    try {
      return await fetchApi('/programs', {
        method: 'POST',
        body: JSON.stringify(programData),
      });
    } catch (error) {
      console.error('Error creating program:', error);
      throw error;
    }
  },
  update: async (id, programData) => {
    try {
      return await fetchApi(`/programs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(programData),
      });
    } catch (error) {
      console.error('Error updating program:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      return await fetchApi(`/programs/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting program:', error);
      throw error;
    }
  },
};
