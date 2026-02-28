'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ApexCharts to avoid SSR issues
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

// Predefined color palette
const lineColors = [
  '#800000', // Red
  '#1E40AF', // Blue
  '#16A34A', // Green
  '#CA8A04', // Yellow
  '#7E22CE', // Purple
  '#EA580C', // Orange
  '#DB2777', // Pink
];

export default function NationalTrendsChart({ nationalRates = [] }) {
  const processChartData = () => {
    if (!nationalRates || nationalRates.length === 0) {
      return { series: [], categories: [] };
    }

    const programs = [
      ...new Set(
        nationalRates.map(
          (rate) => rate.program_id?.program || 'Unknown Program'
        )
      ),
    ];

    const allDates = [
      ...new Set(nationalRates.map((rate) => `${rate.month} ${rate.year}`)),
    ].sort((a, b) => {
      const [aMonth, aYear] = a.split(' ');
      const [bMonth, bYear] = b.split(' ');
      const aDate = new Date(`${aMonth} 1, ${aYear}`);
      const bDate = new Date(`${bMonth} 1, ${bYear}`);
      return aDate - bDate;
    });

    const series = programs.map((program, index) => {
      const programData = allDates.map((date) => {
        const [month, year] = date.split(' ');
        const dataPoint = nationalRates.find(
          (rate) =>
            rate.month === month &&
            rate.year === year &&
            rate.program_id?.program === program
        );
        return dataPoint ? parseFloat(dataPoint.passing_rate) : null;
      });

      return {
        name: program,
        data: programData,
      };
    });

    return { series, categories: allDates };
  };

  const { series, categories } = processChartData();

  const chartOptions = {
    chart: {
      id: 'national-passing-rates-bar',
      type: 'bar',
      height: 350,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
        },
      },
      animations: {
        enabled: true,
      },
    },
    colors: lineColors,
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 0, // No lines for bar chart
    },
    xaxis: {
      categories: categories,
      labels: {
        rotate: -45,
        style: {
          fontSize: '11px',
          colors: '#6b7280', // gray-500
        },
        trim: true,
        hideOverlappingLabels: true,
      },
      title: {
        text: 'Exam Period',
        style: {
          color: '#374151', // gray-700
          fontSize: '12px',
          fontWeight: 500,
        },
      },
      tickPlacement: 'on',
    },
    yaxis: {
      min: 0,
      max: 100,
      title: {
        text: 'Passing Rate (%)',
        style: {
          color: '#374151', // gray-700
          fontSize: '12px',
          fontWeight: 500,
        },
      },
      labels: {
        formatter: (value) => `${value !== null ? value.toFixed(1) : 'N/A'}%`,
        style: {
          colors: '#6b7280', // gray-500
          fontSize: '11px',
        },
      },
    },
    tooltip: {
      y: {
        formatter: (value) => (value !== null ? `${value.toFixed(1)}%` : 'N/A'),
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      fontSize: '12px',
      markers: {
        width: 10,
        height: 10,
        radius: 5,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
    },
    grid: {
      borderColor: '#e5e7eb', // gray-200
      strokeDashArray: 4,
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '60%',
        dataLabels: {
          position: 'top', // Display value on top if enabled
        },
      },
    },
  };

  return (
    <section className='rounded-xl bg-white border border-gray-100 p-4 md:p-6'>
      <h3 className='text-lg md:text-xl font-semibold text-gray-800 mb-6'>
        National Passing Rate Trends
      </h3>
      {series && series.length > 0 ? (
        <div className='h-80 md:h-96'>
          <ReactApexChart
            options={chartOptions}
            series={series}
            type='bar' // Changed to bar chart
            height='100%'
            width='100%'
          />
        </div>
      ) : (
        <div className='bg-gray-50 rounded-lg p-6 md:p-8 text-center'>
          <p className='text-gray-600'>
            No national passing rate trend data available
          </p>
        </div>
      )}
    </section>
  );
}
