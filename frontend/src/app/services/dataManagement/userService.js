import { fetchApi } from '../../lib/api.js';

// Service to handle CRUD operations for users
export const userService = {
  getAll: async () => {
    try {
      const data = await fetchApi('/users');
      return { data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { data: [], error: error.message, isLoading: false };
    }
  },
  getById: async (id) => {
    try {
      const data = await fetchApi(`/users/${id}`);
      return { data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error fetching user:', error);
      return { data: null, error: error.message, isLoading: false };
    }
  },
  create: async (userData) => {
    try {
      return await fetchApi('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  update: async (id, userData) => {
    try {
      return await fetchApi(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(userData),
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      return await fetchApi(`/users/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },
  checkUsername: async (username, excludeId) => {
    try {
      let url = `/users/check-username?username=${encodeURIComponent(
        username
      )}`;
      if (excludeId) url += `&excludeId=${encodeURIComponent(excludeId)}`;
      return await fetchApi(url);
    } catch (error) {
      console.error('Error checking username:', error);
      return { exists: false, error: true };
    }
  },
};
