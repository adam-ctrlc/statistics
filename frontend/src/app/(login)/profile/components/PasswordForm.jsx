'use client';

import React, { useState, useEffect } from 'react';
import {
  FaLock,
  FaCheck,
  FaEye,
  FaEyeSlash,
  FaExclamationTriangle,
  FaSave,
} from 'react-icons/fa';
import { z } from 'zod';
import { updatePassword } from '@/app/services/auth/profileService';

// Define password schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[^A-Za-z0-9]/,
        'Password must contain at least one special character'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function PasswordForm({
  formData,
  username,
  user,
  handleInputChange,
  onPasswordUpdateSuccess,
  onPasswordUpdateError,
}) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    type: null,
    message: null,
  });

  useEffect(() => {
    if (
      submitStatus.type &&
      (formData.currentPassword ||
        formData.newPassword ||
        formData.confirmPassword)
    ) {
      setSubmitStatus({ type: null, message: null });
      if (
        validationErrors.currentPassword === 'Current password is incorrect'
      ) {
        setValidationErrors((prev) => ({
          ...prev,
          currentPassword: undefined,
        }));
      }
    }
  }, [
    formData.currentPassword,
    formData.newPassword,
    formData.confirmPassword,
    submitStatus.type,
    validationErrors.currentPassword,
  ]);

  const validatePasswords = (currentPassword, newPassword, confirmPassword) => {
    try {
      passwordSchema.parse({ currentPassword, newPassword, confirmPassword });
      setValidationErrors({});
      setIsFormValid(true);
      return true;
    } catch (error) {
      const formattedErrors = {};
      error.errors.forEach((err) => {
        if (err.path[0] === 'currentPassword') {
          formattedErrors.currentPassword = err.message;
        } else if (err.path[0] === 'newPassword') {
          formattedErrors.newPassword = err.message;
        } else if (err.path[0] === 'confirmPassword') {
          formattedErrors.confirmPassword = err.message;
        }
      });
      if (submitStatus.message === 'Current password is incorrect') {
        formattedErrors.currentPassword = 'Current password is incorrect';
      }
      setValidationErrors(formattedErrors);
      setIsFormValid(Object.keys(formattedErrors).length === 0);
      return false;
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    if (['currentPassword', 'newPassword', 'confirmPassword'].includes(name)) {
      e.target.value = value.replace(/\s+/g, '');
    }

    handleInputChange(e);

    const fields = {
      currentPassword:
        name === 'currentPassword' ? value : formData.currentPassword,
      newPassword: name === 'newPassword' ? value : formData.newPassword,
      confirmPassword:
        name === 'confirmPassword' ? value : formData.confirmPassword,
    };

    validatePasswords(
      fields.currentPassword,
      fields.newPassword,
      fields.confirmPassword
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validatePasswords(
      formData.currentPassword,
      formData.newPassword,
      formData.confirmPassword
    );

    if (!isValid) return;

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: null });

    const passwordData = {
      userId: user?._id || user?.id || '',
      username: username || '',
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword,
    };

    console.log('Submitting password update with user data:', {
      userId: passwordData.userId,
      username: passwordData.username,
      userObject: {
        _id: user?._id,
        id: user?.id,
        fullUser: user,
      },
    });

    try {
      const result = await updatePassword(passwordData);

      if (result.type === 'success') {
        setSubmitStatus({ type: 'success', message: result.message });
        if (onPasswordUpdateSuccess) onPasswordUpdateSuccess(result.message);
        handleInputChange({ target: { name: 'currentPassword', value: '' } });
        handleInputChange({ target: { name: 'newPassword', value: '' } });
        handleInputChange({ target: { name: 'confirmPassword', value: '' } });
        setValidationErrors({});
      } else {
        setSubmitStatus({ type: 'error', message: result.message });
        if (result.message === 'Current password is incorrect') {
          setValidationErrors((prev) => ({
            ...prev,
            currentPassword: 'Current password is incorrect',
          }));
        } else if (onPasswordUpdateError) {
          onPasswordUpdateError(result.message);
        }
      }
    } catch (error) {
      console.error('Password update failed:', error);
      const errorMessage = error.message || 'An unexpected error occurred.';
      setSubmitStatus({ type: 'error', message: errorMessage });
      if (onPasswordUpdateError) onPasswordUpdateError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type='hidden' name='userId' value={user?._id || user?.id || ''} />
      <input type='hidden' name='username' value={username || ''} />

      <div className='p-6'>
        {submitStatus.type === 'error' && (
          <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2'>
            <FaExclamationTriangle className='h-5 w-5 text-red-500 shrink-0 mt-0.5' />
            <p className='text-sm text-red-700'>{submitStatus.message}</p>
          </div>
        )}
        {submitStatus.type === 'success' && (
          <div className='mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2'>
            <FaCheck className='h-5 w-5 text-green-500 shrink-0 mt-0.5' />
            <p className='text-sm text-green-700'>{submitStatus.message}</p>
          </div>
        )}

        <div className='space-y-6'>
          <input
            type='text'
            name='username'
            autoComplete='username'
            value={username || ''}
            readOnly
            className='hidden'
            aria-hidden='true'
          />

          <div className='flex flex-col gap-2'>
            <label
              htmlFor='currentPassword'
              className='block text-sm font-medium text-gray-700'
            >
              Current Password
            </label>
            <div className='relative'>
              <FaLock
                className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400'
              />
              <input
                id='currentPassword'
                type={showCurrentPassword ? 'text' : 'password'}
                name='currentPassword'
                className={`w-full border ${
                  validationErrors.currentPassword
                    ? 'border-red-500'
                    : 'border-gray-200'
                } rounded-lg pl-10 pr-10 py-3 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent text-sm`}
                placeholder='Enter current password'
                value={formData.currentPassword}
                onChange={handlePasswordChange}
                autoComplete='current-password'
                required
                disabled={isSubmitting}
              />
              <button
                type='button'
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                aria-label={
                  showCurrentPassword ? 'Hide password' : 'Show password'
                }
                disabled={isSubmitting}
              >
                {showCurrentPassword ? (
                  <FaEyeSlash className='h-4 w-4' />
                ) : (
                  <FaEye className='h-4 w-4' />
                )}
              </button>
            </div>
            {validationErrors.currentPassword && (
              <p className='text-xs text-red-500'>
                {validationErrors.currentPassword}
              </p>
            )}
          </div>

          <div className='flex flex-col gap-2'>
            <label
              htmlFor='newPassword'
              className='block text-sm font-medium text-gray-700'
            >
              New Password
            </label>
            <div className='relative'>
              <FaLock
                className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400'
              />
              <input
                id='newPassword'
                type={showNewPassword ? 'text' : 'password'}
                name='newPassword'
                className={`w-full border ${
                  validationErrors.newPassword
                    ? 'border-red-500'
                    : 'border-gray-200'
                } rounded-lg pl-10 pr-10 py-3 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent text-sm`}
                placeholder='Enter new password'
                value={formData.newPassword}
                onChange={handlePasswordChange}
                autoComplete='new-password'
                required
                disabled={isSubmitting}
              />
              <button
                type='button'
                onClick={() => setShowNewPassword(!showNewPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                disabled={isSubmitting}
              >
                {showNewPassword ? (
                  <FaEyeSlash className='h-4 w-4' />
                ) : (
                  <FaEye className='h-4 w-4' />
                )}
              </button>
            </div>
            {validationErrors.newPassword ? (
              <p className='text-xs text-red-500'>
                {validationErrors.newPassword}
              </p>
            ) : (
              <p className='text-xs text-gray-500'>
                Password must be at least 8 characters long, contain at least
                one uppercase letter, one lowercase letter, one number, and one
                special character.
              </p>
            )}
          </div>

          <div className='flex flex-col gap-2'>
            <label
              htmlFor='confirmPassword'
              className='block text-sm font-medium text-gray-700'
            >
              Confirm New Password
            </label>
            <div className='relative'>
              <FaLock
                className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400'
              />
              <input
                id='confirmPassword'
                type={showConfirmPassword ? 'text' : 'password'}
                name='confirmPassword'
                className={`w-full border ${
                  validationErrors.confirmPassword
                    ? 'border-red-500'
                    : 'border-gray-200'
                } rounded-lg pl-10 pr-10 py-3 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent text-sm`}
                placeholder='Confirm new password'
                value={formData.confirmPassword}
                onChange={handlePasswordChange}
                autoComplete='new-password'
                required
                disabled={isSubmitting}
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                aria-label={
                  showConfirmPassword ? 'Hide password' : 'Show password'
                }
                disabled={isSubmitting}
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className='h-4 w-4' />
                ) : (
                  <FaEye className='h-4 w-4' />
                )}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className='text-xs text-red-500'>
                {validationErrors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <div className='mt-8 flex justify-end'>
          <button
            type='submit'
            disabled={isSubmitting || !isFormValid}
            className='inline-flex items-center gap-2 bg-red-700 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isSubmitting ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                Updating...
              </>
            ) : (
              <>
                <FaSave className='h-4 w-4' />
                Update Password
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
