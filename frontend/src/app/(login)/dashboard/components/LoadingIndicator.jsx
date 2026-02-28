'use client';

import React from 'react';

export default function LoadingIndicator() {
  return (
    <div
      className='flex flex-col space-y-4 py-10'
      aria-label='Loading data'
    >
      <div className='animate-pulse space-y-4'>
        <div className='h-4 bg-gray-300 rounded w-3/4 mx-auto'></div>
        <div className='h-4 bg-gray-300 rounded w-1/2 mx-auto'></div>
        <div className='h-4 bg-gray-300 rounded w-2/3 mx-auto'></div>
      </div>
    </div>
  );
}
