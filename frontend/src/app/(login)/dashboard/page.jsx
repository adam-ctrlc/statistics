"use client";

import React from "react";
import {
  Users,
  CheckCircle,
  Repeat,
  Award,
  BarChart,
  UserCheck,
  Users2,
} from "@/app/components/icons";
import { FaUniversity, FaCheckCircle, FaUsers } from "react-icons/fa";

// Import components from the correct path
import DashboardHeader from "./components/DashboardHeader";
import ErrorAlert from "./components/ErrorAlert";
import LoadingIndicator from "./components/LoadingIndicator";
import KPICard from "./components/KPICard";
import PerformanceMetricCard from "./components/PerformanceMetricCard";
import DataTable from "./components/DataTable";
import NationalTrendsChart from "./components/NationalTrendsChart";

// Import new hooks
import { useDashboardData } from "../../services/hooks";

export default function Dashboard() {
  // Use dashboard service hook instead of hardcoded data
  const {
    statistics,
    statisticsSummary,
    statisticsLoading,
    statisticsError,
    nationalRates,
    nationalRatesLoading,
    nationalRatesError,
    userProfile,
    userProfileLoading,
    userProfileError,
  } = useDashboardData();

  // Determine loading and error states
  const isLoading =
    statisticsLoading || nationalRatesLoading || userProfileLoading;
  const error = statisticsError || nationalRatesError || userProfileError;

  if (error) {
    return (
      <ErrorAlert message={error} onRetry={() => window.location.reload()} />
    );
  }

  // Process data for components (can be memoized later if needed)
  const totalStudents = statisticsSummary?.total_students || 0;
  const passedStudents = statisticsSummary?.passed_students || 0;
  const totalRetakers = statisticsSummary?.total_retakers || 0;
  const firstTimeStudents = Math.max(0, totalStudents - totalRetakers);
  const firstTimePassRate =
    firstTimeStudents > 0 ? (passedStudents / firstTimeStudents) * 100 : 0;
  // Retake pass rate
  const retakerPassed = statisticsSummary?.retaker_passed || 0;
  const retakers = statisticsSummary?.retakers || 0;
  const retakePassRate =
    typeof statisticsSummary?.retaker_pass_rate === "number"
      ? statisticsSummary.retaker_pass_rate
      : retakers > 0
      ? (retakerPassed / retakers) * 100
      : 0;

  const topPrograms = statisticsSummary?.topPrograms || [];
  const nationalRatesData = nationalRates || [];
  const recentStudents = statisticsSummary?.recent_students || [];

  const latestNationalRatesYear =
    nationalRatesData.length > 0
      ? Math.max(...nationalRatesData.map((rate) => parseInt(rate.year)))
      : new Date().getFullYear();

  const latestNationalRates = nationalRatesData
    .filter((rate) => parseInt(rate.year) === latestNationalRatesYear)
    .sort((a, b) => {
      const monthOrder = {
        January: 1,
        February: 2,
        March: 3,
        April: 4,
        May: 5,
        June: 6,
        July: 7,
        August: 8,
        September: 9,
        October: 10,
        November: 11,
        December: 12,
      };
      return monthOrder[a.month] - monthOrder[b.month];
    });

  // Gender distribution
  const genderCounts = statisticsSummary?.genderCounts || {};
  const genderTotal = Object.values(genderCounts).reduce((a, b) => a + b, 0);
  const genderDistribution = [
    {
      label: `Male (${genderCounts.male || 0})`,
      value: `${(((genderCounts.male || 0) / (genderTotal || 1)) * 100).toFixed(
        1
      )}%`,
      percentage: ((genderCounts.male || 0) / (genderTotal || 1)) * 100,
      gradient: "bg-gradient-to-r from-blue-700 to-blue-500",
    },
    {
      label: `Female (${genderCounts.female || 0})`,
      value: `${(
        ((genderCounts.female || 0) / (genderTotal || 1)) *
        100
      ).toFixed(1)}%`,
      percentage: ((genderCounts.female || 0) / (genderTotal || 1)) * 100,
      gradient: "bg-gradient-to-r from-pink-700 to-pink-400",
    },
    // Add 'Other' if present
    ...(genderCounts.other || genderCounts.unknown
      ? [
          {
            label: `Other (${genderCounts.other || genderCounts.unknown || 0})`,
            value: `${(
              ((genderCounts.other || genderCounts.unknown || 0) /
                (genderTotal || 1)) *
              100
            ).toFixed(1)}%`,
            percentage:
              ((genderCounts.other || genderCounts.unknown || 0) /
                (genderTotal || 1)) *
              100,
            gradient: "bg-gradient-to-r from-gray-600 to-gray-400",
          },
        ]
      : []),
  ];

  // Column definitions for tables
  const topProgramsColumns = [
    { header: "Program", accessor: "program_name" },
    {
      header: "Pass Rate",
      accessor: "passing_rate",
      render: (row) => `${row.passing_rate?.toFixed(1) || "0"}%`,
    },
    {
      header: "Total Examinees",
      accessor: "total_students",
      render: (row) => row.total_students?.toLocaleString() || "0",
    },
    {
      header: "Passed",
      accessor: "passed_students",
      render: (row) => row.passed_students?.toLocaleString() || "0",
    },
  ];

  const nationalRatesColumns = [
    { header: "Month", accessor: "month" },
    {
      header: "Program",
      accessor: "program",
      render: (row) => row.program_id?.program || "Unknown Program",
    },
    {
      header: "Passing Rate",
      accessor: "passing_rate",
      render: (row) => `${parseFloat(row.passing_rate).toFixed(1)}%`,
    },
  ];

  const recentStudentsColumns = [
    {
      header: "Name",
      accessor: "name",
      render: (row) => `${row.last_name}, ${row.first_name}`,
    },
    { header: "Program", accessor: "program_name" },
    {
      header: "Exam Date",
      accessor: "exam_date",
      render: (row) =>
        row.exam_month_taken && row.exam_year_taken
          ? `${row.exam_month_taken} ${row.exam_year_taken}`
          : "N/A",
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => {
        const status = row.status && row.status.trim() ? row.status : "Pending";
        let badgeClass = "";
        if (status.toLowerCase() === "passed") {
          badgeClass = "bg-green-100 text-green-800";
        } else if (status.toLowerCase() === "failed") {
          badgeClass = "bg-red-100 text-red-800";
        } else {
          badgeClass = "bg-yellow-100 text-yellow-800";
        }
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}
          >
            {status}
          </span>
        );
      },
    },
  ];

  // Calculate distribution for first-time vs retakers
  const firstTimePct =
    totalStudents > 0 ? (firstTimeStudents / totalStudents) * 100 : 0;
  const retakerPct =
    totalStudents > 0 ? (totalRetakers / totalStudents) * 100 : 0;

  const handleRetry = () => {
    console.log("Retry fetching data...");
  };

  return (
    <section className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-red-800 mb-2">
          Board Examination Dashboard
        </h1>
        <p className="text-gray-600">
          Comprehensive overview of board examination performance metrics
        </p>
      </div>

      <ErrorAlert error={error} onRetry={handleRetry} />

      {isLoading ? (
        <div className="space-y-8 md:space-y-12">
          {/* KPI Cards Skeleton */}
          <section className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </div>
          </section>

          {/* Performance Metrics Skeleton */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 animate-pulse">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-40 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </section>

          {/* Tables Skeleton */}
          {[...Array(3)].map((_, tableIndex) => (
            <section key={tableIndex} className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-56 mb-6"></div>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
                  <div className="flex space-x-4">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="h-4 bg-gray-200 rounded w-20"
                      ></div>
                    ))}
                  </div>
                </div>
                {[...Array(5)].map((_, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="border-b border-gray-100 px-6 py-4"
                  >
                    <div className="flex space-x-4">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="h-4 bg-gray-200 rounded w-24"
                        ></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPIs */}
          <section aria-labelledby="kpi-title">
            <h2
              id="kpi-title"
              className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 md:mb-6"
            >
              Key Performance Indicators
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <KPICard
                title="Total Examinees"
                value={totalStudents.toLocaleString()}
                description="All registered examinees"
                icon={Users}
                iconBgColor="bg-red-100"
                iconTextColor="text-red-800"
                gradientTo="to-red-50"
                loading={statisticsLoading}
              />
              <KPICard
                title="Overall Pass Rate"
                value={`${
                  statisticsSummary?.overall_passing_rate?.toFixed(1) || "0"
                }%`}
                description="Examinees who passed"
                icon={CheckCircle}
                iconBgColor="bg-green-100"
                iconTextColor="text-green-600"
                gradientTo="to-green-50"
                loading={statisticsLoading}
              />
              <KPICard
                title="Retake Rate"
                value={`${(
                  (totalRetakers / (totalStudents || 1)) *
                  100
                ).toFixed(1)}%`}
                description="Students retaking the exam"
                icon={Repeat}
                iconBgColor="bg-yellow-100"
                iconTextColor="text-yellow-600"
                gradientTo="to-yellow-50"
                loading={statisticsLoading}
              />
              <KPICard
                title="Top Program"
                value={`${topPrograms[0]?.passing_rate?.toFixed(1) || "0"}%`}
                description={topPrograms[0]?.program_name || "N/A"}
                icon={Award}
                iconBgColor="bg-blue-100"
                iconTextColor="text-blue-600"
                gradientTo="to-blue-50"
                loading={statisticsLoading}
              />
            </div>
          </section>

          {/* Performance Metrics */}
          <section
            aria-labelledby="performance-metrics-title"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8"
          >
            <h2 id="performance-metrics-title" className="sr-only">
              Performance Metrics
            </h2>
            <PerformanceMetricCard
              title="First-time vs. Retake Distribution"
              mainValue={`${firstTimePct.toFixed(
                1
              )}% First-time, ${retakerPct.toFixed(1)}% Retakers`}
              description="Distribution of examinees by group"
              icon={BarChart}
              iconBgColor="bg-red-100"
              iconTextColor="text-red-800"
              distributionBar={{
                left: {
                  label: `First-time (${firstTimeStudents})`,
                  value: `${firstTimePct.toFixed(1)}%`,
                  percentage: firstTimePct,
                  color: "bg-red-600",
                },
                right: {
                  label: `Retakers (${totalRetakers})`,
                  value: `${retakerPct.toFixed(1)}%`,
                  percentage: retakerPct,
                  color: "bg-yellow-400",
                },
              }}
              loading={statisticsLoading}
            />
            <PerformanceMetricCard
              title="Gender Distribution"
              mainValue={genderTotal.toLocaleString()}
              description="Distribution of examinees by gender"
              icon={Users2}
              iconBgColor="bg-purple-100"
              iconTextColor="text-purple-600"
              metrics={genderDistribution}
              loading={statisticsLoading}
            />
          </section>

          {/* Top Programs Table */}
          <section aria-labelledby="top-programs-title">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
                <FaUniversity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Top Performing Programs
                </h2>
                <p className="text-gray-600 mt-1">
                  Program performance ranked by pass rates
                </p>
              </div>
            </div>
            <DataTable
              columns={topProgramsColumns}
              data={topPrograms}
              emptyStateMessage="No program data available"
              tableType="programs"
            />
          </section>

          {/* National Passing Rates Table */}
          <section aria-labelledby="national-rates-title">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center">
                <FaCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  National Passing Rates ({latestNationalRatesYear})
                </h2>
                <p className="text-gray-600 mt-1">
                  Nationwide benchmark comparison
                </p>
              </div>
            </div>
            <DataTable
              columns={nationalRatesColumns}
              data={latestNationalRates}
              emptyStateMessage="No national passing rate data available"
              tableType="rates"
            />
          </section>

          {/* National Rate Trends Chart */}
          <NationalTrendsChart nationalRates={nationalRatesData} />

          {/* Recent Students Table */}
          <section aria-labelledby="recent-examinees-title">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center">
                <FaUsers className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Recent Examinees
                </h2>
                <p className="text-gray-600 mt-1">
                  Latest student examination records
                </p>
              </div>
            </div>
            <DataTable
              columns={recentStudentsColumns}
              data={recentStudents}
              emptyStateMessage="No recent students data available"
              tableType="examinees"
            />
          </section>
        </div>
      )}
    </section>
  );
}
