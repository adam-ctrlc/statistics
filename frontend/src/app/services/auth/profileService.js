import { useAxiosFetch } from '../hooks/useAxiosFetch';
import { z } from 'zod';

export const useProfileData = () => {
  const axiosOptions = { method: 'GET', withCredentials: true };
  const profile = useAxiosFetch('/auth/profile', axiosOptions);

  return {
    profile: profile.data,
    profileLoading: profile.loading,
    profileError: profile.error,
  };
};

export const updateProfile = async (userId, profileData) => {
  try {
    // Ensure userId is a string, handle potential null/undefined
    const userIdStr = String(userId || '');
    if (!userIdStr) {
      throw new Error('User ID is required to update profile.');
    }

    console.log(`[Service] Updating profile for user ${userIdStr}`);

    // Use fetchApi which already handles the base URL
    const { fetchApi } = require('@/app/lib/api');
    const response = await fetchApi(`/users/${userIdStr}`, {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
    return response;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const updatePassword = async ({
  userId,
  username,
  currentPassword,
  newPassword,
  confirmPassword,
}) => {
  try {
    console.log('[Service] updatePassword called with userId:', userId);

    // Ensure userId is a string
    const userIdStr = String(userId);

    // 1. Verify current password
    const { fetchApi } = require('@/app/lib/api');
    const verifyRes = await fetchApi('/auth/verify-password', {
      method: 'POST',
      body: JSON.stringify({ username, password: currentPassword }),
    });

    if (!verifyRes) {
      return {
        type: 'error',
        message: 'Current password is incorrect',
      };
    }

    // 2. Update password
    const updateRes = await fetchApi(`/users/${userIdStr}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ password: newPassword }),
    });

    console.log('[Service] Password update successful');
    return { type: 'success', message: 'Password updated successfully.' };
  } catch (error) {
    console.error('[Service] Error in updatePassword:', error);
    return {
      type: 'error',
      message: error.message || 'Failed to update password.',
    };
  }
};

// Zod schema for validation within the action
const profileSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .regex(/^[a-zA-Z\s]*$/, 'First name can only contain letters and spaces'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .regex(/^[a-zA-Z\s]*$/, 'Last name can only contain letters and spaces'),
  middle_name: z
    .string()
    .regex(/^[a-zA-Z\s]*$/, 'Middle name can only contain letters and spaces')
    .optional()
    .or(z.literal('')),
  username: z.string().min(1, 'Username is required'),
});

// Helper function for title case and single space
function toTitleCaseSingleSpace(str) {
  return str
    .replace(/\s+/g, ' ') // Replace multiple spaces with one
    .replace(/^\s+|\s+$/g, '') // Trim leading/trailing spaces
    .replace(/\b\w/g, (txt) => txt.toUpperCase()) // Capitalize first letter of each word
    .replace(/(\B\w+)/g, (txt) => txt.toLowerCase()); // Lowercase the rest
}
