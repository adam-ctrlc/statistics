'use client';

import React from 'react';
import { FaChartLine, FaDotCircle, FaEquals } from 'react-icons/fa';

export default function PerformanceMetricCard({
  title,
  mainValue,
  description,
  icon: Icon,
  iconBgColor = 'bg-gray-100',
  iconTextColor = 'text-gray-600',
  metrics = [], // Array of { label: string, value: string | number, percentage: number, gradient: string }
  loading = false,
  distributionBar = null, // { left: { label, value, percentage, color }, right: { label, value, percentage, color } }
}) {
  return (
    <article className='bg-white rounded-3xl p-6 md:p-8 relative overflow-hidden'>
      {/* Subtle background element */}
      <div className='absolute top-6 right-6 opacity-5'>
        <FaChartLine className='w-20 h-20 text-gray-400' />
      </div>

      <div className='flex items-start justify-between mb-8 relative z-10'>
        <div className='flex-1'>
          <div className='flex items-center gap-3 mb-4'>
            <FaDotCircle className='w-3 h-3 text-red-800' />
            <span className='text-xs text-gray-500 uppercase tracking-widest font-medium'>
              PERFORMANCE
            </span>
          </div>
          <div className='text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3'>
            {loading ? (
              <span className='inline-block h-10 w-32 bg-gray-200 rounded-xl animate-pulse' />
            ) : (
              mainValue
            )}
          </div>
          <h3 className='text-lg md:text-xl font-semibold text-gray-800 mb-2'>
            {title}
          </h3>
          <p className='text-sm text-gray-600 max-w-sm leading-relaxed'>
            {description}
          </p>
        </div>
        {Icon && (
          <div className={`w-20 h-20 rounded-2xl ${iconBgColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`h-10 w-10 ${iconTextColor}`} />
          </div>
        )}
      </div>
      {/* Custom distribution bar for two groups */}
      {distributionBar && !loading && (
        <div className='mb-6 relative z-10'>
          <div className='flex justify-between items-center mb-4'>
            <div className='flex items-center gap-3'>
              <div className={`w-4 h-4 rounded-full ${distributionBar.left.color}`}></div>
              <span className='text-sm font-medium text-gray-700'>
                {distributionBar.left.label}
              </span>
            </div>
            <div className='flex items-center gap-3'>
              <span className='text-sm font-medium text-gray-700'>
                {distributionBar.right.label}
              </span>
              <div className={`w-4 h-4 rounded-full ${distributionBar.right.color}`}></div>
            </div>
          </div>
          <div className='w-full bg-gray-100 rounded-full h-6 flex overflow-hidden'>
            <div
              className={`${distributionBar.left.color} rounded-l-full`}
              style={{ width: `${distributionBar.left.percentage}%` }}
            ></div>
            <div
              className={`${distributionBar.right.color} rounded-r-full`}
              style={{ width: `${distributionBar.right.percentage}%` }}
            ></div>
          </div>
          <div className='flex justify-between mt-3'>
            <span className='text-sm text-gray-600 font-medium'>
              {distributionBar.left.value}
            </span>
            <span className='text-sm text-gray-600 font-medium'>
              {distributionBar.right.value}
            </span>
          </div>
        </div>
      )}
      {/* Default metrics bar if not using distributionBar */}
      {!distributionBar && (
        <div className='mt-8 space-y-6 relative z-10'>
          {loading
            ? Array.from({ length: 2 }).map((_, idx) => (
                <div key={idx} className='w-full'>
                  <div className='flex justify-between items-center mb-3'>
                    <span className='inline-block h-4 w-24 bg-gray-200 rounded-xl animate-pulse' />
                    <span className='inline-block h-4 w-12 bg-gray-200 rounded-xl animate-pulse' />
                  </div>
                  <div className='w-full bg-gray-100 rounded-full h-4'>
                    <div
                      className='h-4 rounded-full bg-gray-200 animate-pulse'
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </div>
              ))
            : metrics.map((metric, index) => (
                <div key={index}>
                  <div className='flex justify-between items-center mb-3'>
                    <div className='flex items-center gap-3'>
                      <FaDotCircle className='w-2 h-2 text-red-800' />
                      <span className='text-sm font-medium text-gray-700'>
                        {metric.label}
                      </span>
                    </div>
                    <span className='text-sm font-bold text-gray-900'>
                      {metric.value}
                    </span>
                  </div>
                  <div className='w-full bg-gray-100 rounded-full h-4 overflow-hidden'>
                    <div
                      className={`h-4 rounded-full ${metric.gradient}`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, metric.percentage)
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
        </div>
      )}
    </article>
  );
}
