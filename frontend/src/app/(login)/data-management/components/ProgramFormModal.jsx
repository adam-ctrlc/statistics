"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { Save, BookCopy, Hash, Building } from "@/app/components/icons";
import AlertMessage from "@/app/(login)/profile/components/AlertMessage";
import MainModal from "./MainModal"; // Import MainModal
import CustomSelect from "../../../components/CustomSelect";
import { departmentService } from "../../../services/dataManagement/departmentService";

// Zod schema for client-side feedback
const programSchema = z
  .string()
  .min(1, "Required")
  .regex(/^[a-zA-Z\s\-\&\(\)]+$/, "Only letters, spaces, and - & () allowed"); // Allow more chars
const codeSchema = z.string().optional(); // Code is optional
const departmentSchema = z.string().min(1, "Department is required");

// Main Modal Component
export default function ProgramFormModal({
  isOpen,
  onClose,
  formAction, // now a direct handler
  actionState, // can be used for error/success
  program, // Program object being edited (null if adding)
  isEditing,
}) {
  const [formData, setFormData] = useState({
    program: "",
    department_id: "",
    id: "",
  });
  const [clientErrors, setClientErrors] = useState({});
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [departmentsError, setDepartmentsError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const [formLoading, setFormLoading] = useState(true); // New state for overall form loading

  useEffect(() => {
    async function fetchDepartments() {
      setLoadingDepartments(true);
      setDepartmentsError(null);
      try {
        const res = await departmentService.getAll();
        setDepartments(res.data || []);
      } catch (err) {
        setDepartmentsError("Failed to load departments.");
        setDepartments([]);
      } finally {
        setLoadingDepartments(false);
      }
    }
    if (isOpen) fetchDepartments();
  }, [isOpen]);

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      const initialData =
        isEditing && program
          ? {
              id: program._id || program.id || "",
              program: program.program || "",
              department_id:
                program.department_id?._id?.toString() ||
                program.department_id?.id?.toString() ||
                program.department_id?.toString() ||
                "",
            }
          : {
              program: "",
              department_id: "",
              id: "",
            };
      setFormData(initialData);
      setClientErrors({}); // Clear client errors on open
      setSubmitError(null);
      setFormLoading(false); // Data ready, so stop form loading
    }
  }, [program, isEditing, isOpen]);

  // Client-side validation feedback
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let currentErrors = { ...clientErrors };
    let processedValue = value;

    if (name === "program") {
      processedValue = value.replace(/[^a-zA-Z\s\-\&\(\)]/g, ""); // Allow specific chars
      try {
        programSchema.parse(processedValue);
        delete currentErrors[name];
      } catch (err) {
        currentErrors[name] = err.errors[0].message;
      }
    }
    if (name === "department_id") {
      try {
        departmentSchema.parse(value);
        delete currentErrors[name];
      } catch (err) {
        currentErrors[name] = err.errors[0].message;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    setClientErrors(currentErrors);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    // Validate before submit
    try {
      programSchema.parse(formData.program);
      departmentSchema.parse(formData.department_id);
      await formAction(formData);
    } catch (err) {
      if (err.errors && err.errors[0]) {
        setClientErrors((prev) => ({
          ...prev,
          [err.errors[0].path[0]]: err.errors[0].message,
        }));
      } else {
        setSubmitError("Validation failed.");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <MainModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Program" : "Add New Program"}
      isEditing={isEditing}
      onSubmit={handleSubmit}
      isPending={formLoading || loadingDepartments} // Use overall formLoading and department loading
      showSubmitButton={!formLoading} // Hide submit button while form is loading
    >
      {formLoading ? (
        <div className="p-6 space-y-4 animate-pulse">
          {/* Program Name Skeleton */}
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          {/* Department Select Skeleton */}
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : (
        <>
          {submitError && <AlertMessage message={submitError} type="error" />}
          {actionState?.type === "error" && (
            <AlertMessage message={actionState.message} type="error" />
          )}
          {departmentsError && (
            <AlertMessage message={departmentsError} type="error" />
          )}
          {isEditing && (
            <input type="hidden" name="id" value={formData.id || ""} />
          )}
          {/* Program Name */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="program"
              className="block text-sm font-medium text-gray-700"
            >
              Program Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <BookCopy
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                strokeWidth={1.5}
              />
              <input
                type="text"
                id="program"
                name="program"
                autoComplete="off"
                value={formData.program || ""}
                onChange={handleInputChange}
                required
                className={`w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm ${
                  clientErrors.program ? "border-red-500" : ""
                }`}
              />
            </div>
            {clientErrors.program && (
              <span className="text-red-500 text-xs">
                {clientErrors.program}
              </span>
            )}
          </div>
          {/* Department */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="department_id"
              className="block text-sm font-medium text-gray-700"
            >
              Department <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10"
                strokeWidth={1.5}
              />
              <CustomSelect
                id="department_id"
                name="department_id"
                value={formData.department_id || ""}
                onChange={handleInputChange}
                options={
                  loadingDepartments
                    ? [{ value: "", label: "Loading departments..." }]
                    : [
                        { value: "", label: "Select Department" },
                        ...departments.map((d) => ({
                          value: d._id?.toString() || d.id?.toString() || "",
                          label: d.name,
                        })),
                      ]
                }
                className={`pl-10 ${
                  clientErrors.department_id ? "border-red-500" : ""
                }`}
              />
            </div>
            {clientErrors.department_id && (
              <span className="text-red-500 text-xs">
                {clientErrors.department_id}
              </span>
            )}
          </div>
        </>
      )}
    </MainModal>
  );
}
