'use client';

import React, { useRef, useEffect } from 'react';

function IndeterminateCheckbox({ indeterminate, className = '', ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    if (typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate, rest.checked]);

  return (
    <input
      type='checkbox'
      ref={ref}
      name={rest.name || 'table-selection'}
      aria-label={rest['aria-label'] || 'Select row'}
      className={
        className +
        ' cursor-pointer h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded'
      }
      {...rest}
    />
  );
}

export default IndeterminateCheckbox;
