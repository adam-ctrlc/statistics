"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import { AlertTriangle } from "@/app/components/icons";
import { useFormStatus } from "react-dom";
import {
  Filter,
  Search,
  X,
  CalendarDays,
  School,
  BookCopy,
} from "@/app/components/icons";
import CustomSelect from "../../components/CustomSelect";
import { compareDataService } from "@/app/services/compareDataService";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 bg-red-800 text-white px-5 py-2.5 text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <div className="h-3 w-12 bg-white/20 rounded animate-pulse"></div>
          Comparing...
        </>
      ) : (
        <>
          <Search className="h-4 w-4" strokeWidth={2} />
          Compare
        </>
      )}
    </button>
  );
}

function ResetButton({ onClick }) {
  return (
    <button
      type="reset"
      onClick={onClick} // Form reset needs explicit handling
      className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
    >
      <X className="h-4 w-4" strokeWidth={2} />
      Reset
    </button>
  );
}

export default function ComparisonForm({ formAction, options, isPending }) {
  const { programs = [], schools = [], years = [], months = [] } = options;

  // Map options to the { value, label } format
  const programOptions = Array.isArray(programs)
    ? programs
        .filter((p) => p && p.id && p.name)
        .map((p) => ({ value: p.id, label: p.name }))
    : [];
  const schoolOptions = Array.isArray(schools)
    ? schools
        .filter((s) => s && s.id && s.name)
        .map((s) => ({ value: s.id, label: s.name }))
    : [];

  // Local state for dynamic months/years
  const [primaryProgram, setPrimaryProgram] = useState("");
  const [primaryMonths, setPrimaryMonths] = useState([]);
  const [primaryYears, setPrimaryYears] = useState([]);
  const [primaryLoading, setPrimaryLoading] = useState(false);
  const [primaryError, setPrimaryError] = useState(null);

  const [secondaryProgram, setSecondaryProgram] = useState("");
  const [secondaryMonths, setSecondaryMonths] = useState([]);
  const [secondaryYears, setSecondaryYears] = useState([]);
  const [secondaryLoading, setSecondaryLoading] = useState(false);
  const [secondaryError, setSecondaryError] = useState(null);

  const [formError, setFormError] = useState(null);

  // Zod schema for validation
  const comparisonSchema = z
    .object({
      primaryProgram: z.string().min(1, "Please select a primary program"),
      primarySchool: z.string().optional().nullable(),
      primaryMonth: z.string().optional().nullable(),
      primaryYear: z.string().optional().nullable(),
      secondaryProgram: z.string().min(1, "Please select a secondary program"),
      secondarySchool: z.string().optional().nullable(),
      secondaryMonth: z.string().optional().nullable(),
      secondaryYear: z.string().optional().nullable(),
    })
    .refine(
      (data) => {
        // Only error if ALL fields are the same
        return !(
          data.primaryProgram === data.secondaryProgram &&
          (data.primarySchool || "") === (data.secondarySchool || "") &&
          (data.primaryMonth || "") === (data.secondaryMonth || "") &&
          (data.primaryYear || "") === (data.secondaryYear || "")
        );
      },
      {
        message: "Primary and Secondary selections cannot be exactly the same.",
      }
    );

  // Fetch months/years when primary program changes
  useEffect(() => {
    if (!primaryProgram) {
      setPrimaryMonths([]);
      setPrimaryYears([]);
      return;
    }
    setPrimaryLoading(true);
    setPrimaryError(null);
    compareDataService
      .getMonthsAndYearsByProgram(primaryProgram)
      .then(({ months, years }) => {
        console.log("Primary fetched for program", primaryProgram, {
          months,
          years,
        });
        setPrimaryMonths(months);
        setPrimaryYears(years);
      })
      .catch((err) => {
        setPrimaryError("Failed to load months/years for this program");
        setPrimaryMonths([]);
        setPrimaryYears([]);
      })
      .finally(() => setPrimaryLoading(false));
  }, [primaryProgram]);

  // Fetch months/years when secondary program changes
  useEffect(() => {
    if (!secondaryProgram) {
      setSecondaryMonths([]);
      setSecondaryYears([]);
      return;
    }
    setSecondaryLoading(true);
    setSecondaryError(null);
    compareDataService
      .getMonthsAndYearsByProgram(secondaryProgram)
      .then(({ months, years }) => {
        console.log("Secondary fetched for program", secondaryProgram, {
          months,
          years,
        });
        setSecondaryMonths(months);
        setSecondaryYears(years);
      })
      .catch((err) => {
        setSecondaryError("Failed to load months/years for this program");
        setSecondaryMonths([]);
        setSecondaryYears([]);
      })
      .finally(() => setSecondaryLoading(false));
  }, [secondaryProgram]);

  // Map to select options
  const yearOptions = (arr) =>
    Array.isArray(arr)
      ? arr
          .filter((y) => typeof y === "string" || typeof y === "number")
          .map((y) => ({ value: y, label: String(y) }))
      : [];
  const monthOptions = (arr) =>
    Array.isArray(arr)
      ? arr
          .filter((m) => typeof m === "string" && m.trim() !== "")
          .map((m) => ({ value: m, label: m }))
      : [];

  const handleReset = (e) => {
    setPrimaryProgram("");
    setPrimaryMonths([]);
    setPrimaryYears([]);
    setPrimaryError(null);
    setSecondaryProgram("");
    setSecondaryMonths([]);
    setSecondaryYears([]);
    setSecondaryError(null);
    // Optionally reset form fields
    // e.target.form.reset();
    console.log("Reset clicked");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    const formData = new FormData(e.target);
    const values = {
      primaryProgram: formData.get("primaryProgram") || "",
      primarySchool: formData.get("primarySchool") || "",
      primaryMonth: formData.get("primaryMonth") || "",
      primaryYear: formData.get("primaryYear") || "",
      secondaryProgram: formData.get("secondaryProgram") || "",
      secondarySchool: formData.get("secondarySchool") || "",
      secondaryMonth: formData.get("secondaryMonth") || "",
      secondaryYear: formData.get("secondaryYear") || "",
    };
    const result = comparisonSchema.safeParse(values);
    if (!result.success) {
      const firstError = result.error.errors[0];
      setFormError(firstError.message);
      return;
    }
    formAction(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-100 rounded-xl p-6 md:p-8"
    >
      {formError && (
        <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-400 text-red-800 px-4 py-3 rounded-lg">
          <AlertTriangle
            className="w-5 h-5 text-red-500 flex-shrink-0"
            strokeWidth={2}
          />
          <span>{formError}</span>
        </div>
      )}
      <fieldset disabled={isPending} className="group">
        <legend className="sr-only">Comparison Criteria</legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
          {/* --- Primary Selection --- */}
          <section className="flex flex-col gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50/50">
            <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Primary Selection
            </h3>
            {/* Primary Program */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="primaryProgram"
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700"
              >
                <BookCopy className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
                Program <span className="text-red-600">*</span>
              </label>
              <CustomSelect
                id="primaryProgram"
                name="primaryProgram"
                required
                options={programOptions}
                placeholder="Select Program"
                defaultValue={primaryProgram}
                onChange={(e) => {
                  const value = e.target.value;
                  console.log("Primary program changed:", value);
                  setPrimaryProgram(value);
                }}
                className="group-disabled:opacity-50"
              />
            </div>
            {/* Primary School (Optional) */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="primarySchool"
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700"
              >
                <School className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
                School (Optional)
              </label>
              <CustomSelect
                id="primarySchool"
                name="primarySchool"
                options={schoolOptions}
                placeholder="All Schools"
                defaultValue=""
                className="group-disabled:opacity-50"
              />
            </div>
            {/* Primary Month/Year (Optional) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="primaryMonth"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-700"
                >
                  <CalendarDays
                    className="h-4 w-4 text-gray-400"
                    strokeWidth={1.5}
                  />
                  Month
                </label>
                <CustomSelect
                  id="primaryMonth"
                  name="primaryMonth"
                  options={monthOptions(primaryMonths)}
                  placeholder={primaryLoading ? "Loading..." : "Any Month"}
                  defaultValue=""
                  isLoading={primaryLoading}
                  className="group-disabled:opacity-50"
                  isDisabled={!primaryProgram || primaryLoading}
                />
                {primaryError && (
                  <span className="text-xs text-red-600">{primaryError}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="primaryYear"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-700"
                >
                  <CalendarDays
                    className="h-4 w-4 text-gray-400"
                    strokeWidth={1.5}
                  />
                  Year
                </label>
                <CustomSelect
                  id="primaryYear"
                  name="primaryYear"
                  options={yearOptions(primaryYears)}
                  placeholder={primaryLoading ? "Loading..." : "Any Year"}
                  defaultValue=""
                  isLoading={primaryLoading}
                  className="group-disabled:opacity-50"
                  isDisabled={!primaryProgram || primaryLoading}
                />
                {primaryError && (
                  <span className="text-xs text-red-600">{primaryError}</span>
                )}
              </div>
            </div>
          </section>

          {/* --- Secondary Selection --- */}
          <section className="flex flex-col gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50/50">
            <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Secondary Selection
            </h3>
            {/* Secondary Program */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="secondaryProgram"
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700"
              >
                <BookCopy className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
                Program <span className="text-red-600">*</span>
              </label>
              <CustomSelect
                id="secondaryProgram"
                name="secondaryProgram"
                required
                options={programOptions}
                placeholder="Select Program"
                defaultValue={secondaryProgram}
                onChange={(e) => {
                  const value = e.target.value;
                  console.log("Secondary program changed:", value);
                  setSecondaryProgram(value);
                }}
                className="group-disabled:opacity-50"
              />
            </div>
            {/* Secondary School (Optional) */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="secondarySchool"
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700"
              >
                <School className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
                School (Optional)
              </label>
              <CustomSelect
                id="secondarySchool"
                name="secondarySchool"
                options={schoolOptions}
                placeholder="All Schools"
                defaultValue=""
                className="group-disabled:opacity-50"
              />
            </div>
            {/* Secondary Month/Year (Optional) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="secondaryMonth"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-700"
                >
                  <CalendarDays
                    className="h-4 w-4 text-gray-400"
                    strokeWidth={1.5}
                  />
                  Month
                </label>
                <CustomSelect
                  id="secondaryMonth"
                  name="secondaryMonth"
                  options={monthOptions(secondaryMonths)}
                  placeholder={secondaryLoading ? "Loading..." : "Any Month"}
                  defaultValue=""
                  isLoading={secondaryLoading}
                  className="group-disabled:opacity-50"
                  isDisabled={!secondaryProgram || secondaryLoading}
                />
                {secondaryError && (
                  <span className="text-xs text-red-600">{secondaryError}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="secondaryYear"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-700"
                >
                  <CalendarDays
                    className="h-4 w-4 text-gray-400"
                    strokeWidth={1.5}
                  />
                  Year
                </label>
                <CustomSelect
                  id="secondaryYear"
                  name="secondaryYear"
                  options={yearOptions(secondaryYears)}
                  placeholder={secondaryLoading ? "Loading..." : "Any Year"}
                  defaultValue=""
                  isLoading={secondaryLoading}
                  className="group-disabled:opacity-50"
                  isDisabled={!secondaryProgram || secondaryLoading}
                />
                {secondaryError && (
                  <span className="text-xs text-red-600">{secondaryError}</span>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col md:flex-row justify-end items-center gap-3 pt-4 border-t border-gray-100">
          <ResetButton onClick={handleReset} />
          <SubmitButton />
        </div>
      </fieldset>
    </form>
  );
}
