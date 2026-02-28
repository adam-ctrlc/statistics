'use client';

import React from 'react';
import { FaTachometerAlt, FaCircle } from 'react-icons/fa';

export default function DashboardHeader({ title, subtitle }) {
  return (
    <header className='mb-12'>
      <div className='flex items-center gap-6 mb-6'>
        <div className='w-14 h-14 bg-red-800 rounded-2xl flex items-center justify-center'>
          <FaTachometerAlt className='w-7 h-7 text-white' />
        </div>
        <div>
          <h1 className='text-3xl md:text-4xl font-bold text-gray-900 tracking-tight'>
            {title}
          </h1>
          <div className='flex items-center gap-3 mt-2'>
            <div className='flex items-center gap-1'>
              <FaCircle className='w-2 h-2 text-green-500' />
              <span className='text-sm text-gray-600 font-medium'>Live</span>
            </div>
            <div className='w-1 h-1 bg-gray-300 rounded-full'></div>
            <span className='text-sm text-gray-500'>Real-time Analytics</span>
          </div>
        </div>
      </div>
      
      <p className='text-gray-600 text-lg leading-relaxed max-w-2xl'>{subtitle}</p>
    </header>
  );
}
