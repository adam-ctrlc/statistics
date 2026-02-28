"use client";
import { useState, useEffect } from "react";
import MainModal from "./MainModal";

export default function StatusFormModal({
  isOpen,
  onClose,
  onSubmit,
  status,
  isEditing,
}) {
  // Initialize form state
  const [formData, setFormData] = useState({
    status: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false); // Add formLoading state

  // Reset form when status changes or modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && status) {
      // Simulate async fetch if status data is not fully populated (e.g., from a list summary)
      // For now, assume `status` prop contains all necessary data for editing.
      // If `status` only contains an ID and you need to fetch full details,
      // you would add an async fetch here and setFormLoading(true/false).
      setFormData({
        status: status.status || "",
        description: status.description || "",
      });
      setFormLoading(false); // Data is already here or simulated as loaded
    } else {
      // Default values for new status
      setFormData({
        status: "",
        description: "",
      });
      setFormLoading(false);
    }
    // Clear any errors
    setErrors({});
  }, [status, isEditing, isOpen]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Validate the form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.status.trim()) {
      newErrors.status = "Status name is required";
    } else if (formData.status.trim().length < 2) {
      newErrors.status = "Status name must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <MainModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Status" : "Add New Status"}
      isEditing={isEditing}
      isPending={formLoading} // Pass loading state to MainModal for submit button
    >
      {formLoading ? (
        <div className="p-6 space-y-4 animate-pulse">
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="status-form">
          {/* Status Name */}
          <div className="mb-4">
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status Name *
            </label>
            <input
              type="text"
              id="status"
              name="status"
              autoComplete="off"
              value={formData.status}
              onChange={handleChange}
              placeholder="Enter status name"
              className={`w-full border ${
                errors.status ? "border-red-500" : "border-gray-200"
              } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500`}
              disabled={
                isEditing &&
                (status?.status === "active" || status?.status === "inactive")
              }
              required
            />
            {errors.status && (
              <p className="mt-1 text-red-500 text-sm">{errors.status}</p>
            )}
            {isEditing &&
              (status?.status === "active" ||
                status?.status === "inactive") && (
                <p className="mt-1 text-gray-500 text-sm">
                  Default status names cannot be changed
                </p>
              )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter status description"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              rows="3"
            />
          </div>
        </form>
      )}
    </MainModal>
  );
}
