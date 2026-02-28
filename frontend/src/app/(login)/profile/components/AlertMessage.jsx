'use client';

import React from 'react';

export default function AlertMessage({ message, type = 'error' }) {
  if (!message) return null;

  const baseClasses = 'p-4 rounded-lg mb-6 text-sm md:text-base';
  const typeClasses = {
    error: 'bg-red-50 border border-red-200 text-red-800',
    success: 'bg-green-50 border border-green-200 text-green-800',
  };

  return (
    <div
      className={`${baseClasses} ${typeClasses[type]}`}
      role={type === 'error' ? 'alert' : 'status'}
    >
      {message}
    </div>
  );
}
