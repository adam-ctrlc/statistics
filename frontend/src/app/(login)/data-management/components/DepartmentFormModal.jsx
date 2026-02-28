"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { Save, Building } from "@/app/components/icons";
import AlertMessage from "@/app/(login)/profile/components/AlertMessage";
import MainModal from "./MainModal"; // Import MainModal
import Loading from "@/app/components/Loading";

// Define Zod schema for client-side validation
const departmentSchema = z
  .string()
  .min(1, "Required")
  .regex(/^[a-zA-Z\s\&\-]+$/, "Only letters, spaces, &, and - allowed"); // Allow more chars

export default function DepartmentFormModal({
  isOpen,
  onClose,
  formAction, // now a direct handler
  actionState, // can be used for error/success
  department, // Department object being edited
  isEditing,
  loading = false, // Keep this prop if it's used elsewhere for general loading status
}) {
  // State for form input
  const [formData, setFormData] = useState({ name: "", id: "" });
  // State for client-side validation errors
  const [clientErrors, setClientErrors] = useState({});
  // State for submission error
  const [submitError, setSubmitError] = useState(null);
  const [formLoading, setFormLoading] = useState(true); // New state for content loading

  // Reset form when department changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (isEditing && department) {
        setFormData({
          name: department.name || "",
          id: department._id || department.id || "",
        });
      } else {
        setFormData({ name: "", id: "" }); // Reset for add
      }
      setClientErrors({}); // Clear client errors on open
      setSubmitError(null);
      setFormLoading(false); // Data is ready or reset, stop form loading
    }
  }, [department, isEditing, isOpen]);

  // Function to handle form input changes with client-side validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let currentErrors = { ...clientErrors };
    // Allow letters, spaces, ampersand, hyphen
    const sanitizedValue = value.replace(/[^a-zA-Z\s\&\-]/g, "");

    // Validate using Zod schema
    try {
      departmentSchema.parse(sanitizedValue);
      delete currentErrors[name];
    } catch (err) {
      currentErrors[name] = err.errors[0].message;
    }

    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    setClientErrors(currentErrors);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    // Validate before submit
    try {
      departmentSchema.parse(formData.name);
      // Call parent handler with formData
      await formAction(formData);
    } catch (err) {
      if (err.errors && err.errors[0]) {
        setClientErrors((prev) => ({ ...prev, name: err.errors[0].message }));
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
      title={isEditing ? "Edit Department" : "Add Department"}
      isEditing={isEditing}
      onSubmit={handleSubmit}
      isPending={loading || formLoading} // Combine external loading with internal formLoading for submit button
      showSubmitButton={!(loading || formLoading)} // Hide submit button if overall modal or form is loading
    >
      {formLoading ? (
        <div className="p-6 space-y-4 animate-pulse">
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : (
        <>
          {submitError && <AlertMessage message={submitError} type="error" />}
          {actionState?.type === "error" && (
            <AlertMessage message={actionState.message} type="error" />
          )}
          {isEditing && <input type="hidden" name="id" value={formData.id} />}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Department Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                strokeWidth={1.5}
              />
              <input
                type="text"
                id="name"
                name="name"
                autoComplete="off"
                value={formData.name || ""}
                onChange={handleInputChange}
                required
                className={`w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm ${
                  clientErrors.name ? "border-red-500" : ""
                }`}
              />
            </div>
            {clientErrors.name && (
              <span className="text-red-500 text-xs">{clientErrors.name}</span>
            )}
          </div>
        </>
      )}
    </MainModal>
  );
}
