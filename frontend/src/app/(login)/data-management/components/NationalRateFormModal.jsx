"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { Save, Calendar, Percent, CalendarDays, BookCopy } from "@/app/components/icons";
import AlertMessage from "@/app/(login)/profile/components/AlertMessage";
import MainModal from "./MainModal"; // Import MainModal
import CustomSelect from "@/app/components/CustomSelect";
import { programService } from "../../../services/dataManagement/programService";

const yearSchema = z
  .string()
  .min(4, "Must be a 4-digit year")
  .max(4, "Must be a 4-digit year")
  .regex(/^\d{4}$/, "Must be a 4-digit year");

const rateSchema = z
  .string()
  .min(1, "Rate is required")
  .refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    },
    { message: "Must be a number between 0 and 100" }
  );

const monthSchema = z.string().min(1, "Month is required");
const programSchema = z.string().min(1, "Program is required");

// Main Modal Component for National Rates
export default function NationalRateFormModal({
  isOpen,
  onClose,
  formAction,
  rate, // Rate object being edited (null if adding)
  isEditing,
}) {
  const [formData, setFormData] = useState({
    year: "",
    month: "",
    passing_rate: "",
    program_id: "",
  });
  const [clientErrors, setClientErrors] = useState({});
  const [programs, setPrograms] = useState([]);
  const [availableMonths] = useState([
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
  ]);
  const [loadingOptions, setLoadingOptions] = useState(false); // Renamed from 'loading' for clarity
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPrograms() {
      setLoadingOptions(true); // Set loading true when fetching options
      setError(null);
      try {
        const res = await programService.getAll();
        setPrograms(res.data || []);
      } catch (err) {
        setPrograms([]);
        setError("Failed to load programs.");
      } finally {
        setLoadingOptions(false); // Set loading false after fetching
      }
    }
    if (isOpen) fetchPrograms();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const initialData =
        isEditing && rate
          ? {
              id: rate.id,
              year: rate.year?.toString() || "",
              month: rate.month || "",
              passing_rate: rate.passing_rate?.toString() || "",
              program_id: rate.program_id?._id || rate.program_id || "",
            }
          : {
              year: "",
              month: "",
              passing_rate: "",
              program_id: "",
            };
      setFormData(initialData);
      setClientErrors({});
      setError(null);
    }
  }, [rate, isEditing, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let currentErrors = { ...clientErrors };
    let schema;
    let processedValue = value;
    if (name === "year") {
      schema = yearSchema;
      processedValue = value.replace(/[^\d]/g, "");
      if (processedValue.length > 4)
        processedValue = processedValue.slice(0, 4);
    }
    if (name === "passing_rate") {
      schema = rateSchema;
      processedValue = value.replace(/[^\d.]/g, "");
      const parts = processedValue.split(".");
      if (parts.length > 2)
        processedValue = parts[0] + "." + parts.slice(1).join("");
    }
    if (name === "month") schema = monthSchema;
    if (name === "program_id") schema = programSchema;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingOptions(true); // Use loadingOptions for form submission as well
    setError(null);
    try {
      // Compose FormData for compatibility with parent handler
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      await formAction(data);
    } catch (err) {
      setError(err?.message || "An error occurred.");
    } finally {
      setLoadingOptions(false);
    }
  };

  if (!isOpen) return null;

  return (
    <MainModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditing ? "Edit National Passing Rate" : "Add National Passing Rate"
      }
      isEditing={isEditing}
      onSubmit={handleSubmit}
      isPending={loadingOptions} // Pass loading state to MainModal
    >
      {loadingOptions ? (
        <div className="p-6 space-y-4 animate-pulse">
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Program Select */}
          {error && <AlertMessage message={error} type="error" />}
          {isEditing && (
            <input type="hidden" name="id" value={formData.id || ""} />
          )}
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
              value={formData.program_id}
              onChange={handleInputChange}
              options={[
                { value: "", label: "Select Program" },
                ...(programs.map((p) => ({
                  value: p._id,
                  label: p.program,
                })) || []),
              ]}
              required
              className={`input-field w-full border ${
                clientErrors.program_id ? "border-red-500" : "border-gray-200"
              } rounded-lg p-2.5 text-sm`}
            />
            {clientErrors.program_id && (
              <p className="text-xs text-red-500">{clientErrors.program_id}</p>
            )}
          </div>
          {/* Month Select */}
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
              value={formData.month}
              onChange={handleInputChange}
              options={[
                { value: "", label: "Select Month" },
                ...availableMonths.map((m) => ({ value: m, label: m })),
              ]}
              required
              className={`input-field w-full border ${
                clientErrors.month ? "border-red-500" : "border-gray-200"
              } rounded-lg p-2.5 text-sm`}
            />
            {clientErrors.month && (
              <p className="text-xs text-red-500">{clientErrors.month}</p>
            )}
          </div>
          {/* Year Input */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="year"
              className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
            >
              <Calendar className="h-4 w-4 text-gray-400" /> Year{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="year"
              name="year"
              autoComplete="off"
              value={formData.year || ""}
              onChange={handleInputChange}
              required
              maxLength={4}
              placeholder="YYYY"
              disabled={isEditing}
              className={`input-field w-full border ${
                clientErrors.year ? "border-red-500" : "border-gray-200"
              } rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                isEditing ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
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
              placeholder="e.g., 75.2"
              className={`input-field w-full border ${
                clientErrors.passing_rate ? "border-red-500" : "border-gray-200"
              } rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent`}
            />
            {clientErrors.passing_rate && (
              <p className="text-xs text-red-500">
                {clientErrors.passing_rate}
              </p>
            )}
          </div>
        </>
      )}
    </MainModal>
  );
}
