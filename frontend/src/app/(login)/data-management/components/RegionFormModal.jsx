"use client";
import { useState, useEffect } from "react";
import MainModal from "./MainModal";

export default function RegionFormModal({
  isOpen,
  onClose,
  onSubmit,
  region,
  isEditing,
}) {
  // State for form input
  const [formData, setFormData] = useState({
    name: "",
  });

  const [formLoading, setFormLoading] = useState(false); // Add formLoading state

  // Reset form when region changes
  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && region) {
      // Simulate async fetch if region data is not fully populated
      // For now, assume `region` prop contains all necessary data.
      setFormData({
        name: region.name || "",
      });
      setFormLoading(false); // Data is already here or simulated as loaded
    } else {
      // Reset form when adding a new region
      setFormData({
        name: "",
      });
      setFormLoading(false);
    }
  }, [region, isEditing, isOpen]);

  // Function to handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <MainModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Region" : "Add New Region"}
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
        <div className="grid grid-cols-1 gap-4">
          <div className="form-group">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Region Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              autoComplete="off"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>
        </div>
      )}
    </MainModal>
  );
}
