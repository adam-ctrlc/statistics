'use client';

import React from 'react';
import { FaSave, FaUser, FaAt, FaBuilding } from 'react-icons/fa';

// Helper function for title case and single space
function toTitleCaseSingleSpace(str) {
  return str
    .replace(/\s+/g, ' ') // Replace multiple spaces with one
    .replace(/^\s+|\s+$/g, '') // Trim leading/trailing spaces
    .replace(/\b\w/g, (txt) => txt.toUpperCase()) // Capitalize first letter of each word
    .replace(/(\B\w+)/g, (txt) => txt.toLowerCase()); // Lowercase the rest
}

export default function ProfileForm({
  formData,
  user,
  validationErrors,
  handleInputChange,
  onSubmit,
  isPending,
}) {
  // On change: just update as typed
  const handleNameChange = (e) => {
    handleInputChange(e);
  };

  // On blur: process and update
  const handleNameBlur = (e) => {
    const { name, value } = e.target;
    if (['first_name', 'last_name', 'middle_name'].includes(name)) {
      const processedValue = toTitleCaseSingleSpace(value);
      handleInputChange({
        target: {
          name,
          value: processedValue,
        },
      });
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div className='p-6'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Status (Read Only) */}
          <div className='flex flex-col gap-2'>
            <p className='block text-sm font-medium text-gray-700'>
              Status
            </p>
            <div className='flex items-center h-[46px]'>
              <div
                className={`w-3 h-3 ${
                  user?.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                } rounded-full mr-2 flex-shrink-0`}
              ></div>
              <span className='text-sm text-gray-700 capitalize'>
                {user?.status || 'N/A'}
              </span>
            </div>
          </div>

          {/* School (Read Only) */}
          <div className='flex flex-col gap-2'>
            <label
              htmlFor='school'
              className='block text-sm font-medium text-gray-700'
            >
              School
            </label>
            <div className='relative'>
              <FaBuilding
                className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400'
              />
              <input
                id='school'
                type='text'
                autoComplete='off'
                className='w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 bg-gray-50 focus:outline-none text-sm cursor-not-allowed'
                value={user?.school_id?.school || 'N/A'}
                readOnly
                tabIndex={-1}
              />
            </div>
          </div>

          {/* First Name */}
          <div className='flex flex-col gap-2'>
            <label
              htmlFor='first_name'
              className='block text-sm font-medium text-gray-700'
            >
              First Name
            </label>
            <div className='relative'>
              <FaUser
                className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400'
              />
              <input
                id='first_name'
                type='text'
                name='first_name'
                autoComplete='given-name'
                className='w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent text-sm'
                value={formData.first_name}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                required
                aria-invalid={!!validationErrors.first_name}
                aria-describedby={
                  validationErrors.first_name ? 'first_name-error' : undefined
                }
                disabled={isPending}
              />
            </div>
            {validationErrors.first_name && (
              <span id='first_name-error' className='text-red-500 text-xs'>
                {validationErrors.first_name}
              </span>
            )}
          </div>

          {/* Last Name */}
          <div className='flex flex-col gap-2'>
            <label
              htmlFor='last_name'
              className='block text-sm font-medium text-gray-700'
            >
              Last Name
            </label>
            <div className='relative'>
              <FaUser
                className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400'
              />
              <input
                id='last_name'
                type='text'
                name='last_name'
                autoComplete='family-name'
                className='w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent text-sm'
                value={formData.last_name}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                required
                aria-invalid={!!validationErrors.last_name}
                aria-describedby={
                  validationErrors.last_name ? 'last_name-error' : undefined
                }
                disabled={isPending}
              />
            </div>
            {validationErrors.last_name && (
              <span id='last_name-error' className='text-red-500 text-xs'>
                {validationErrors.last_name}
              </span>
            )}
          </div>

          {/* Middle Name */}
          <div className='flex flex-col gap-2'>
            <label
              htmlFor='middle_name'
              className='block text-sm font-medium text-gray-700'
            >
              Middle Name
            </label>
            <div className='relative'>
              <FaUser
                className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400'
              />
              <input
                id='middle_name'
                type='text'
                name='middle_name'
                autoComplete='additional-name'
                className='w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent text-sm'
                value={formData.middle_name}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                aria-invalid={!!validationErrors.middle_name}
                aria-describedby={
                  validationErrors.middle_name ? 'middle_name-error' : undefined
                }
                disabled={isPending}
              />
            </div>
            {validationErrors.middle_name && (
              <span id='middle_name-error' className='text-red-500 text-xs'>
                {validationErrors.middle_name}
              </span>
            )}
          </div>

          {/* Username (Read Only, styled like School) */}
          <div className='flex flex-col gap-2'>
            <label
              htmlFor='username'
              className='block text-sm font-medium text-gray-700'
            >
              Username
            </label>
            <div className='relative'>
              <FaAt
                className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400'
              />
              <input
                id='username'
                type='text'
                name='username'
                autoComplete='username'
                className='w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 bg-gray-50 focus:outline-none text-sm cursor-not-allowed'
                value={formData.username}
                readOnly
                tabIndex={-1}
                aria-invalid={!!validationErrors.username}
                aria-describedby={
                  validationErrors.username ? 'username-error' : undefined
                }
              />
            </div>
            {validationErrors.username && (
              <span id='username-error' className='text-red-500 text-xs'>
                {validationErrors.username}
              </span>
            )}
          </div>
        </div>

        <div className='mt-8 flex justify-end'>
          <button
            type='submit'
            disabled={isPending}
            className='inline-flex items-center gap-2 bg-red-700 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <FaSave className='h-4 w-4' />
            {isPending ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </div>
    </form>
  );
}
