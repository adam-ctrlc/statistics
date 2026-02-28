"use client";
import { useState, useEffect } from "react";
import { z } from "zod";
import MainModal from "./MainModal"; // Import MainModal

// Define Zod schema for validation
const roleSchema = z
  .string()
  .min(1, "Required")
  .regex(/^[a-zA-Z\s]+$/, "Only letters allowed");

export default function RoleFormModal({
  isOpen,
  onClose,
  onSubmit,
  role,
  isEditing,
}) {
  // Initialize form state
  const [formData, setFormData] = useState({
    role: "",
  });

  // State for validation errors
  const [errors, setErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false); // Add formLoading state

  // Reset form when role changes or modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && role) {
      // Simulate async fetch if role data is not fully populated
      setFormData({
        role: role.role || "",
      });
      setFormLoading(false);
    } else {
      setFormData({
        role: "",
      });
      setFormLoading(false);
    }
    setErrors({});
  }, [role, isEditing, isOpen]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "role") {
      const sanitizedValue = value.replace(/[^a-zA-Z\s]/g, "");
      if (value !== sanitizedValue) {
        setErrors((prev) => ({ ...prev, [name]: "Only letters are allowed" }));
        setTimeout(() => {
          setErrors((prev) => ({ ...prev, [name]: null }));
        }, 2000);
      }
      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      roleSchema.parse(formData.role);
      onSubmit({ role: formData.role });
    } catch (err) {
      setErrors((prev) => ({ ...prev, role: err.errors[0].message }));
    }
  };

  if (!isOpen) return null;

  return (
    <MainModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Role" : "Add New Role"}
      isEditing={isEditing}
      onSubmit={handleSubmit}
      isPending={formLoading} // Pass loading state to MainModal for submit button
    >
      {formLoading ? (
        <div className="p-6 space-y-4 animate-pulse">
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="form-group">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Role Name *
            </label>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                id="role"
                name="role"
                autoComplete="off"
                value={formData.role}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
              {errors.role && (
                <span className="text-red-500 text-sm mt-1">{errors.role}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </MainModal>
  );
}
