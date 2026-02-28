"use client";

import React from "react";
import { Search, X } from "@/app/components/icons";
import CustomSelect from "@/app/components/CustomSelect";
import MultiSelectDropdown from "./MultiSelectDropdown";

export default function TableFilters({
  globalFilter,
  setGlobalFilter,
  programFilter,
  setProgramFilter,
  programs,
  schoolFilter,
  setSchoolFilter,
  schools,
  examStatusFilter,
  setExamStatusFilter,
  examYearFilter,
  setExamYearFilter,
  examYears,
  genderFilter,
  setGenderFilter,
  retakeFilter,
  setRetakeFilter,
  tookExamFilter,
  setTookExamFilter,
  clearAllFilters,
  hasActiveFilters,
  isFiltersLoading = false,
}) {
  // Update program filter handler
  const handleProgramFilter = (selected) => {
    setProgramFilter(selected);
  };

  // Update school filter handler
  const handleSchoolFilter = (selected) => {
    setSchoolFilter(selected);
  };

  // Update exam year filter handler
  const handleExamYearFilter = (selected) => {
    // Remove empty string (the 'All Years' option) from selection
    const filtered = selected.filter((v) => v !== "");

    // If user unchecks all, revert to all years
    if (filtered.length === 0) {
      setExamYearFilter(examYears);
      return;
    }

    // If user selects all years manually, treat as 'all'
    if (filtered.length === examYears.length) {
      setExamYearFilter(examYears);
      return;
    }

    setExamYearFilter(filtered);
  };

  // Compute all values for each multi-select
  const allProgramValues = programs?.map((p) => p._id) || [];
  const allSchoolValues = schools?.map((s) => s._id) || [];
  const allExamYearValues = Array.isArray(examYears)
    ? examYears.filter((year) => year != null && year !== undefined)
    : [];

  if (isFiltersLoading) {
    return (
      <section className="mb-6 space-y-4" aria-label="Table filters">
        {/* Search Bar Skeleton */}
        <div className="flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Filter Controls Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-6 space-y-4" aria-label="Table filters">
      {/* Search Bar */}
      <div className="flex items-center gap-2 w-full">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            id="table-global-search"
            name="table-global-search"
            aria-label="Search table records"
            type="text"
            autoComplete="off"
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search all columns..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Program Filter */}
        <div className="space-y-2">
          <label htmlFor="program-filter" className="block text-sm font-medium text-gray-700">
            Program
          </label>
          <MultiSelectDropdown
            id="program-filter"
            options={[
              { value: "", label: "All Programs" },
              ...(programs?.map((p) => ({ value: p._id, label: p.program })) ||
                []),
            ]}
            selectedValues={
              programFilter.length === 0 ? allProgramValues : programFilter
            }
            onChange={handleProgramFilter}
            placeholder="Select Program"
          />
        </div>

        {/* School Filter */}
        <div className="space-y-2">
          <label htmlFor="school-filter" className="block text-sm font-medium text-gray-700">
            School
          </label>
          <MultiSelectDropdown
            id="school-filter"
            options={[
              { value: "", label: "All Schools" },
              ...(schools?.map((s) => ({ value: s._id, label: s.school })) ||
                []),
            ]}
            selectedValues={
              schoolFilter.length === 0 ? allSchoolValues : schoolFilter
            }
            onChange={handleSchoolFilter}
            placeholder="Select School"
          />
        </div>

        {/* Exam Status Filter */}
        <div className="space-y-2">
          <label htmlFor="exam-status-filter" className="text-sm font-medium text-gray-700">
            Exam Status
          </label>
          <CustomSelect
            id="exam-status-filter"
            name="exam-status-filter"
            value={examStatusFilter || ""}
            onChange={(e) => setExamStatusFilter(e.target.value)}
            options={[
              { value: "", label: "All Exam Statuses" },
              { value: "Passed", label: "Passed" },
              { value: "Failed", label: "Failed" },
              { value: "Pending", label: "Pending" },
            ]}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Exam Year Filter */}
        <div className="space-y-2">
          <label htmlFor="exam-year-filter" className="block text-sm font-medium text-gray-700">
            Exam Year
          </label>
          <MultiSelectDropdown
            id="exam-year-filter"
            options={[
              { value: "", label: "All Years" },
              ...allExamYearValues.map((y) => ({ value: y, label: String(y) })),
            ]}
            selectedValues={examYearFilter}
            onChange={handleExamYearFilter}
            placeholder="Select Year"
          />
        </div>

        {/* Gender Filter */}
        <div className="space-y-2">
          <label htmlFor="gender-filter" className="text-sm font-medium text-gray-700">
            Gender
          </label>
          <CustomSelect
            id="gender-filter"
            name="gender-filter"
            value={genderFilter || ""}
            onChange={(e) => setGenderFilter(e.target.value)}
            options={[
              { value: "", label: "All Genders" },
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
            ]}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Retake Filter */}
        <div className="space-y-2">
          <label htmlFor="retake-filter" className="text-sm font-medium text-gray-700">
            Retake Status
          </label>
          <CustomSelect
            id="retake-filter"
            name="retake-filter"
            value={retakeFilter || ""}
            onChange={(e) => setRetakeFilter(e.target.value)}
            options={[
              { value: "", label: "Retaker Status (All)" },
              { value: "true", label: "Retaker" },
              { value: "false", label: "Not a Retaker" },
            ]}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Took Exam Filter */}
        <div className="space-y-2">
          <label htmlFor="took-exam-filter" className="text-sm font-medium text-gray-700">
            Took Exam
          </label>
          <CustomSelect
            id="took-exam-filter"
            name="took-exam-filter"
            value={tookExamFilter || ""}
            onChange={(e) => setTookExamFilter(e.target.value)}
            options={[
              { value: "", label: "Took Exam? (All)" },
              { value: "true", label: "Yes" },
              { value: "false", label: "No" },
            ]}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center justify-center col-span-1 sm:col-span-2 md:col-span-1 lg:col-start-4 gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <X size={16} />
            Clear All Filters
          </button>
        )}
      </div>
    </section>
  );
}
