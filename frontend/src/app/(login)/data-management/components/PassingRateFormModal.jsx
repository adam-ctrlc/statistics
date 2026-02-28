"use client";

import { useState, useEffect, useCallback } from "react";
import { useFormStatus } from "react-dom";
import { z } from "zod";
import { Save, BookCopy, CalendarDays, Calendar, Percent } from "@/app/components/icons";
import AlertMessage from "@/app/(login)/profile/components/AlertMessage";
import MainModal from "./MainModal"; // Import MainModal
import CustomSelect from "@/app/components/CustomSelect";
import { programService } from "../../../services/dataManagement/programService";

// Zod schemas for client-side feedback (optional but good UX)
const programSchema = z.string().min(1, "Program is required");
const monthSchema = z.string().min(1, "Month is required");
const yearSchema = z.string().min(1, "Year is required");
const rateSchema = z
  .string()
  .min(1, "Passing Rate is required")
  .refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    },
    { message: "Must be a number between 0 and 100" }
  );

// Submit Button
function SubmitButton({ isEditing }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 bg-red-700 text-white px-5 py-2.5 text-sm font-medium rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-wait"
    >
      {pending ? (
        <>
          <span className="animate-spin h-4 w-4 border-t-2 border-r-2 border-white rounded-full"></span>
          Saving...
        </>
      ) : (
        <>
          <Save className="h-4 w-4" strokeWidth={2} />
          {isEditing ? "Update Rate" : "Add Rate"}
        </>
      )}
    </button>
  );
}

// Main Modal Component
export default function PassingRateFormModal({
  isOpen,
  onClose,
  formAction,
  actionState,
  isPending,
  passingRate, // Rate object being edited (null if adding)
  isEditing,
  getAvailableMonthsAction, // Server action to get months
  getAvailableYearsAction, // Server action to get years
}) {
  const [formData, setFormData] = useState({});
  const [clientErrors, setClientErrors] = useState({});
  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [programsError, setProgramsError] = useState(null);

  // State for dynamic dropdown options
  const [availableMonths, setAvailableMonths] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [loadingMonths, setLoadingMonths] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);

  // State to track if fields should be disabled based on selections
  const [disabledFields, setDisabledFields] = useState({
    month: true,
    year: true,
    passing_rate: true,
  });

  const isFormLoading = loadingPrograms || loadingMonths || loadingYears; // Combine all loading states

  // Initialize form data when modal opens or editing state changes
  useEffect(() => {
    if (isOpen) {
      const initialData =
        isEditing && passingRate
          ? {
              id: passingRate.id,
              program_id: passingRate.program_id?.toString() || "",
              month: passingRate.month || "",
              year: passingRate.year?.toString() || "",
              passing_rate: passingRate.passing_rate?.toString() || "", // Store as string for input
            }
          : {
              program_id: "",
              month: "",
              year: "",
              passing_rate: "",
            };
      setFormData(initialData);
      setClientErrors({}); // Clear client errors
      setAvailableMonths([]); // Clear dynamic options
      setAvailableYears([]);
      setDisabledFields({ month: true, year: true, passing_rate: true }); // Reset disabled state

      // If editing, pre-fetch options based on existing data
      if (isEditing && passingRate?.program_id) {
        fetchMonths(passingRate.program_id);
        if (passingRate.month) {
          fetchYears(passingRate.program_id, passingRate.month);
        }
        // Enable fields based on existing data
        setDisabledFields({
          month: !passingRate.program_id,
          year: !passingRate.month,
          passing_rate: !passingRate.year,
        });
      }
    }
  }, [passingRate, isEditing, isOpen]);

  useEffect(() => {
    async function fetchPrograms() {
      setLoadingPrograms(true);
      setProgramsError(null);
      try {
        const res = await programService.getAll();
        setPrograms(res.data || []);
      } catch (err) {
        setProgramsError("Failed to load programs.");
        setPrograms([]);
      } finally {
        setLoadingPrograms(false);
      }
    }
    if (isOpen) fetchPrograms();
  }, [isOpen]);

  // --- Fetch Dynamic Options --- //

  const fetchMonths = useCallback(
    async (programId) => {
      if (!programId) return;
      setLoadingMonths(true);
      setDisabledFields((prev) => ({
        ...prev,
        month: true,
        year: true,
        passing_rate: true,
      }));
      setAvailableMonths([]);
      try {
        const months = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        const result = getAvailableMonthsAction
          ? await getAvailableMonthsAction(programId)
          : { type: "success", data: months };

        if (result.type === "success") {
          setAvailableMonths(result.data || months);
          // Only enable month if there are options available
          setDisabledFields((prev) => ({
            ...prev,
            month: result.data.length === 0,
          }));
        } else {
          console.error("Failed to fetch months:", result.message);
          setAvailableMonths([]);
          setDisabledFields((prev) => ({ ...prev, month: false })); // Still enable, maybe show error
        }
      } catch (error) {
        console.error("Error fetching months:", error);
        setDisabledFields((prev) => ({ ...prev, month: false }));
      } finally {
        setLoadingMonths(false);
      }
    },
    [getAvailableMonthsAction]
  );

  const fetchYears = useCallback(
    async (programId, month) => {
      if (!programId || !month) return;
      setLoadingYears(true);
      setDisabledFields((prev) => ({
        ...prev,
        year: true,
        passing_rate: true,
      }));
      setAvailableYears([]);
      try {
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: 10 }, (_, i) =>
          (currentYear - i).toString()
        );
        const result = getAvailableYearsAction
          ? await getAvailableYearsAction(programId, month)
          : { type: "success", data: years };

        if (result.type === "success") {
          setAvailableYears(result.data || years);
          // Only enable year if there are options available
          setDisabledFields((prev) => ({
            ...prev,
            year: result.data.length === 0,
          }));
        } else {
          console.error("Failed to fetch years:", result.message);
          setAvailableYears([]);
          setDisabledFields((prev) => ({ ...prev, year: false }));
        }
      } catch (error) {
        console.error("Error fetching years:", error);
        setDisabledFields((prev) => ({ ...prev, year: false }));
      } finally {
        setLoadingYears(false);
      }
    },
    [getAvailableYearsAction]
  );

  // Trigger fetching options based on form changes
  useEffect(() => {
    if (formData.program_id) {
      fetchMonths(formData.program_id);
      // Reset subsequent fields if program changes during 'add' mode
      if (!isEditing) {
        setFormData((prev) => ({
          ...prev,
          month: "",
          year: "",
          passing_rate: "",
        }));
        setAvailableYears([]);
      }
    }
  }, [formData.program_id, isEditing, fetchMonths]);

  useEffect(() => {
    if (formData.program_id && formData.month) {
      fetchYears(formData.program_id, formData.month);
      // Reset subsequent fields if month changes during 'add' mode
      if (!isEditing) {
        setFormData((prev) => ({ ...prev, year: "", passing_rate: "" }));
      }
    }
  }, [formData.month, formData.program_id, isEditing, fetchYears]);

  // Enable passing rate input only when year is selected
  useEffect(() => {
    setDisabledFields((prev) => ({
      ...prev,
      passing_rate: !formData.year,
    }));
  }, [formData.year]);

  // --- Input Handling & Client Validation --- //

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let currentErrors = { ...clientErrors };
    let schema;
    let processedValue = value;

    // Select schema based on field name
    if (name === "program_id") schema = programSchema;
    if (name === "month") schema = monthSchema;
    if (name === "year") schema = yearSchema;
    if (name === "passing_rate") {
      schema = rateSchema;
      // Allow only numbers and one decimal point
      processedValue = value.replace(/[^\d.]/g, "");
      // Ensure only one decimal point
      const parts = processedValue.split(".");
      if (parts.length > 2) {
        processedValue = parts[0] + "." + parts.slice(1).join("");
      }
    }

    // Validate using Zod
    if (schema) {
      try {
        schema.parse(processedValue);
        delete currentErrors[name];
      } catch (err) {
        currentErrors[name] = err.errors[0].message;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    setClientErrors(currentErrors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Ensure formAction is called correctly, whether it's a function or server action
    if (typeof formAction === "function") {
      formAction(new FormData(e.target));
    } else {
      // If formAction is not a function, it might be a server action or URL
      e.target.action = formAction;
      e.target.requestSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <MainModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Passing Rate" : "Add Passing Rate"}
      isEditing={isEditing}
      isPending={isPending || isFormLoading} // Combine with isPending prop from parent
      showSubmitButton={!isFormLoading} // Hide submit button if overall form is loading
    >
      {isFormLoading ? (
        <div className="p-6 space-y-4 animate-pulse">
          {/* Program Select Skeleton */}
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          {/* Month Select Skeleton */}
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          {/* Year Select Skeleton */}
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          {/* Passing Rate Input Skeleton */}
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          {actionState?.type === "error" && (
            <AlertMessage message={actionState.message} type="error" />
          )}

          {isEditing && (
            <input type="hidden" name="id" value={formData.id || ""} />
          )}

          {/* Program Selection */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="program_id"
              className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
            >
              <BookCopy className="h-4 w-4 text-gray-400" /> Program{" "}
              <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              id="program_id"
              name="program_id"
              value={formData.program_id || ""}
              onChange={handleInputChange}
              options={
                loadingPrograms
                  ? [{ value: "", label: "Loading programs..." }]
                  : [
                      { value: "", label: "Select Program" },
                      ...programs.map((p) => ({
                        value: p._id?.toString() || p.id?.toString() || "",
                        label: p.program,
                      })),
                    ]
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            {programsError && (
              <AlertMessage message={programsError} type="error" />
            )}
          </div>

          {/* Month Selection */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="month"
              className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
            >
              <CalendarDays className="h-4 w-4 text-gray-400" /> Month{" "}
              <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              id="month"
              name="month"
              value={formData.month || ""}
              onChange={handleInputChange}
              options={availableMonths.map((m) => ({ value: m, label: m }))}
              placeholder={loadingMonths ? "Loading..." : "Select Month"}
              className={`w-full border ${
                clientErrors.month ? "border-red-500" : "border-gray-200"
              } rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent`}
              disabled={disabledFields.month || loadingMonths}
            />
            {clientErrors.month && (
              <p className="text-xs text-red-500">{clientErrors.month}</p>
            )}
          </div>

          {/* Year Selection */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="year"
              className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
            >
              <Calendar className="h-4 w-4 text-gray-400" /> Year{" "}
              <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              id="year"
              name="year"
              value={formData.year || ""}
              onChange={handleInputChange}
              options={availableYears.map((y) => ({
                value: y.toString(),
                label: y.toString(),
              }))}
              placeholder={loadingYears ? "Loading..." : "Select Year"}
              className={`w-full border ${
                clientErrors.year ? "border-red-500" : "border-gray-200"
              } rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent`}
              disabled={disabledFields.year || loadingYears}
            />
            {clientErrors.year && (
              <p className="text-xs text-red-500">{clientErrors.year}</p>
            )}
          </div>

          {/* Passing Rate Input */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="passing_rate"
              className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
            >
              <Percent className="h-4 w-4 text-gray-400" /> Passing Rate (%){" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="passing_rate"
              name="passing_rate"
              autoComplete="off"
              value={formData.passing_rate || ""}
              onChange={handleInputChange}
              required
              disabled={disabledFields.passing_rate}
              placeholder="e.g., 85.5"
              className={`input-field w-full border ${
                clientErrors.passing_rate ? "border-red-500" : "border-gray-200"
              } rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                disabledFields.passing_rate
                  ? "bg-gray-100 cursor-not-allowed"
                  : ""
              }`}
            />
            {clientErrors.passing_rate && (
              <p className="text-xs text-red-500">
                {clientErrors.passing_rate}
              </p>
            )}
          </div>
        </form>
      )}
    </MainModal>
  );
}
