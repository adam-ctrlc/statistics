"use client"; // This page now needs client interactivity for useActionState

import { useEffect, useState } from "react";
import { compareDataService } from "@/app/services/compareDataService";
import ComparisonForm from "./ComparisonForm";
import ComparisonResults from "./ComparisonResults";
import AlertMessage from "@/app/(login)/profile/components/AlertMessage";

const initialActionState = {
  type: null, // 'success' or 'error'
  message: null,
  results: null,
};

export default function CompareDataPage() {
  // State for dropdown options
  const [options, setOptions] = useState({
    programs: [],
    schools: [],
    years: [],
    months: [],
  });
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState(null);
  const [actionState, setActionState] = useState(initialActionState);
  const [isPending, setIsPending] = useState(false);

  // Fetch options on mount
  useEffect(() => {
    async function loadOptions() {
      try {
        setOptionsLoading(true);
        const fetchedOptions = await compareDataService.getComparisonOptions();
        setOptions(fetchedOptions);
        setOptionsError(null);
      } catch (err) {
        console.error("Failed to load comparison options:", err);
        setOptionsError(
          "Could not load filter options. Please try refreshing."
        );
      } finally {
        setOptionsLoading(false);
      }
    }
    loadOptions();
  }, []);

  const handleFormSubmit = async (formData) => {
    setIsPending(true);
    try {
      const results = await compareDataService.compareData(
        Object.fromEntries(formData)
      );
      setActionState({
        type: "success",
        message: "Comparison completed successfully.",
        results,
      });
    } catch (error) {
      setActionState({
        type: "error",
        message: error.message || "An error occurred while comparing data.",
        results: null,
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <article>
      {" "}
      {/* Using article tag */}
      <header className="mb-6 md:mb-8 lg:mb-10">
        <h1 className="text-3xl font-bold text-red-800 mb-2">
          Compare Examination Data
        </h1>
        <p className="text-base lg:text-lg text-gray-600">
          Select different programs, schools, or time periods to analyze and
          compare performance metrics.
        </p>
      </header>
      {/* Display loading indicator for options */}
      {optionsLoading && (
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
            {/* Primary Selection Skeleton */}
            <div className="flex flex-col gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50/50 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>{" "}
              {/* Title */}
              <div className="h-10 bg-gray-200 rounded"></div> {/* Program */}
              <div className="h-10 bg-gray-200 rounded"></div> {/* School */}
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-gray-200 rounded"></div> {/* Month */}
                <div className="h-10 bg-gray-200 rounded"></div> {/* Year */}
              </div>
            </div>
            {/* Secondary Selection Skeleton */}
            <div className="flex flex-col gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50/50 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>{" "}
              {/* Title */}
              <div className="h-10 bg-gray-200 rounded"></div> {/* Program */}
              <div className="h-10 bg-gray-200 rounded"></div> {/* School */}
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-gray-200 rounded"></div> {/* Month */}
                <div className="h-10 bg-gray-200 rounded"></div> {/* Year */}
              </div>
            </div>
          </div>
          {/* Action Buttons Skeleton */}
          <div className="flex flex-col md:flex-row justify-end items-center gap-3 pt-4 border-t border-gray-100 animate-pulse">
            <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>{" "}
            {/* Reset Button */}
            <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>{" "}
            {/* Compare Button */}
          </div>
        </div>
      )}
      {/* Display error if options failed to load */}
      {optionsError && !optionsLoading && (
        <AlertMessage message={optionsError} type="error" />
      )}
      {/* Render form only when options are loaded successfully */}
      {!optionsLoading && !optionsError && (
        <section className="mb-8">
          {" "}
          {/* Using section tag */}
          <ComparisonForm
            formAction={handleFormSubmit}
            options={options}
            isPending={isPending}
          />
        </section>
      )}
      {/* Display comparison status/results */}
      <section aria-live="polite">
        {" "}
        {isPending && (
          <div className="bg-white border border-gray-100 rounded-xl p-6 md:p-8 animate-pulse">
            {/* Header with title and export buttons */}
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 border-b border-gray-100 pb-4">
              <div className="h-8 bg-gray-200 rounded w-64 mb-2 md:mb-0"></div>
              <div className="flex flex-wrap gap-2">
                <div className="h-8 w-28 bg-gray-200 rounded-md"></div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <div className="h-10 w-36 bg-gray-200 rounded-t-lg mr-2"></div>
              <div className="h-10 w-36 bg-gray-200 rounded-t-lg"></div>
            </div>

            {/* Comparison Metrics Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg p-4 h-32">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <div className="bg-gray-100 rounded-lg p-4 h-80">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-52 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 h-80">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-52 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        )}
        {/* Display error messages from the server action */}
        {actionState.type === "error" && (
          <AlertMessage message={actionState.message} type="error" />
        )}
        {/* Display success message or results */}
        {actionState.type === "success" && actionState.message && (
          <AlertMessage
            message={actionState.message}
            type="success"
            className="mb-4"
          />
        )}
        {/* Render results if available and not pending */}
        {!isPending && actionState.results && (
          <ComparisonResults results={actionState.results} />
        )}
        {/* Optional: Show placeholder/instructions if no comparison has been run yet */}
        {!isPending &&
          !actionState.results &&
          !actionState.message &&
          !optionsLoading &&
          !optionsError && (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 md:p-8 text-center">
              <p className="text-gray-500">
                Please select the criteria above and click "Compare" to see the
                results.
              </p>
            </div>
          )}
      </section>
    </article>
  );
}
