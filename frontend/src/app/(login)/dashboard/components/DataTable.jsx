'use client';

import React from 'react';
import { 
  FaGraduationCap, 
  FaChartBar, 
  FaUser, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock,
  FaUniversity,
  FaUsers
} from 'react-icons/fa';

export default function DataTable({
  title,
  subtitle,
  columns = [],
  data = [],
  emptyStateMessage = 'No data available',
  tableType = 'default'
}) {
  if (!data || data.length === 0) {
    return (
      <div className='bg-white rounded-3xl p-12 text-center'>
        <div className='w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4'>
          <FaChartBar className='w-8 h-8 text-gray-400' />
        </div>
        <p className='text-gray-500 text-base font-medium'>{emptyStateMessage}</p>
        <p className='text-gray-400 text-sm mt-2'>Data will appear here when available</p>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    if (!status) return <FaClock className='w-4 h-4 text-gray-400' />;
    const statusLower = status.toLowerCase();
    if (statusLower === 'passed') return <FaCheckCircle className='w-4 h-4 text-green-500' />;
    if (statusLower === 'failed') return <FaTimesCircle className='w-4 h-4 text-red-500' />;
    return <FaClock className='w-4 h-4 text-orange-500' />;
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    const statusLower = status.toLowerCase();
    let bgColor = 'bg-gray-100 text-gray-700';
    if (statusLower === 'passed') bgColor = 'bg-green-100 text-green-800';
    if (statusLower === 'failed') bgColor = 'bg-red-100 text-red-800';
    if (statusLower === 'pending') bgColor = 'bg-orange-100 text-orange-800';
    
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {getStatusIcon(status)}
        {status}
      </span>
    );
  };

  return (
    <div className='bg-white rounded-3xl overflow-hidden'>
      <div className='overflow-x-auto'>
        {tableType === 'programs' ? (
          <div className='space-y-1'>
            {data.map((row, rowIndex) => (
              <div key={rowIndex} className='flex items-center justify-between p-6 hover:bg-gray-50 transition-colors'>
                <div className='flex items-center gap-4 flex-1'>
                  <div className='w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center'>
                    <FaUniversity className='w-5 h-5 text-blue-600' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900 text-lg'>{row.program_name}</h3>
                    <div className='flex items-center gap-4 mt-1'>
                      <div className='flex items-center gap-1'>
                        <FaUsers className='w-3 h-3 text-gray-400' />
                        <span className='text-sm text-gray-600'>{row.total_students?.toLocaleString() || '0'} examinees</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <FaCheckCircle className='w-3 h-3 text-green-500' />
                        <span className='text-sm text-gray-600'>{row.passed_students?.toLocaleString() || '0'} passed</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='text-3xl font-bold text-gray-900 mb-2'>
                    {row.passing_rate?.toFixed(1) || '0'}%
                  </div>
                  <div className='w-24 h-3 bg-gray-100 rounded-full overflow-hidden'>
                    <div 
                      className='h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500'
                      style={{ width: `${Math.min(100, row.passing_rate || 0)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : tableType === 'examinees' ? (
          <div className='space-y-1'>
            {data.map((row, rowIndex) => (
              <div key={rowIndex} className='flex items-center justify-between p-6 hover:bg-gray-50 transition-colors'>
                <div className='flex items-center gap-4 flex-1'>
                  <div className='w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center'>
                    <FaUser className='w-5 h-5 text-purple-600' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900 text-lg'>
                      {row.last_name}, {row.first_name}
                    </h3>
                    <div className='flex items-center gap-4 mt-1'>
                      <div className='flex items-center gap-1'>
                        <FaGraduationCap className='w-3 h-3 text-gray-400' />
                        <span className='text-sm text-gray-600'>{row.program_name}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <FaCalendarAlt className='w-3 h-3 text-gray-400' />
                        <span className='text-sm text-gray-600'>
                          {row.exam_month_taken && row.exam_year_taken
                            ? `${row.exam_month_taken} ${row.exam_year_taken}`
                            : 'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  {getStatusBadge(row.status && row.status.trim() ? row.status : 'Pending')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Default table layout for national rates and other types
          <div className='p-6'>
            <table className='min-w-full'>
              <thead>
                <tr className='border-b border-gray-100'>
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className='px-4 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider'
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex} className='hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0'>
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className='px-4 py-4 text-sm text-gray-900'
                      >
                        {column.render ? column.render(row) : row[column.accessor]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
