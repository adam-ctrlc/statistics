import React from 'react';

/**
 * Loading skeleton component matching the app's theme.
 * Uses Tailwind CSS for styling and accessibility best practices.
 */
const Loading = () => {
  return (
    <div
      className='flex flex-col space-y-4 py-10'
      aria-label='Loading...'
    >
      <div className='animate-pulse space-y-4'>
        <div className='h-4 bg-gray-300 rounded w-3/4 mx-auto'></div>
        <div className='h-4 bg-gray-300 rounded w-1/2 mx-auto'></div>
        <div className='h-4 bg-gray-300 rounded w-2/3 mx-auto'></div>
      </div>
    </div>
  );
};

export default Loading;
