"use client";
import { useState, useEffect } from "react";
import { z } from "zod";
import MainModal from "./MainModal"; // Import MainModal
import CustomSelect from "@/app/components/CustomSelect";
import { regionService } from "../../../services/dataManagement/regionService";

// Define Zod schema for validation
const schoolSchema = z
  .string()
  .min(1, "Required")
  .regex(/^[a-zA-Z\s-]+$/, "Only letters and dashes allowed");

export default function SchoolFormModal({
  isOpen,
  onClose,
  onSubmit,
  school,
  isEditing,
}) {
  // State for form input
  const [formData, setFormData] = useState({
    school: "",
    region_id: "",
    is_phinma: false,
  });

  // State for validation errors
  const [errors, setErrors] = useState({});
  const [regions, setRegions] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [regionsError, setRegionsError] = useState(null);

  // Reset form when school changes
  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && school) {
      let regionId = "";
      if (school.region_id) {
        if (typeof school.region_id === "object") {
          regionId =
            school.region_id._id?.toString() ||
            school.region_id.id?.toString() ||
            "";
        } else {
          regionId = school.region_id.toString();
        }
      }
      setFormData({
        school: school.school || "",
        region_id: regionId,
        is_phinma: school.is_phinma || false,
      });
      setLoadingRegions(false);
    } else {
      // Reset form when adding a new school
      setFormData({
        school: "",
        region_id: "",
        is_phinma: false,
      });
      setLoadingRegions(false);
    }
    setErrors({});
  }, [school, isOpen, isEditing]); // Add isEditing to dependencies

  useEffect(() => {
    async function fetchRegions() {
      setLoadingRegions(true);
      setRegionsError(null);
      try {
        const res = await regionService.getAll();
        setRegions(res.data || []);
      } catch (err) {
        setRegionsError("Failed to load regions.");
        setRegions([]);
      } finally {
        setLoadingRegions(false);
      }
    }
    if (isOpen) fetchRegions();
  }, [isOpen]);

  // Function to handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "school") {
      // Only allow letters, spaces, and dashes
      const sanitizedValue = value.replace(/[^a-zA-Z\s-]/g, "");

      if (value !== sanitizedValue) {
        // Show error if user tried to enter invalid characters
        setErrors((prev) => ({
          ...prev,
          [name]: "Only letters and dashes are allowed",
        }));

        // Set timeout to clear error message after 2 seconds
        setTimeout(() => {
          setErrors((prev) => ({ ...prev, [name]: null }));
        }, 2000);
      }

      // Update form with sanitized value
      setFormData((prev) => ({
        ...prev,
        [name]: sanitizedValue,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields before submission
    try {
      schoolSchema.parse(formData.school);
      onSubmit(formData);
    } catch (err) {
      console.error("Validation error:", err);
      setErrors((prev) => ({
        ...prev,
        school: err.errors[0].message,
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <MainModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit School" : "Add New School"}
      isEditing={isEditing}
      onSubmit={handleSubmit}
      isPending={loadingRegions} // Pass loading state to MainModal for submit button
    >
      {loadingRegions ? (
        <div className="p-6 space-y-4 animate-pulse">
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="mb-4 flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <div className="form-group flex flex-col gap-2">
            <label
              htmlFor="school"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              School Name *
            </label>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                id="school"
                name="school"
                autoComplete="off"
                value={formData.school}
                onChange={handleInputChange}
                className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
              {errors.school && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.school}
                </span>
              )}
            </div>
          </div>

          <div className="form-group flex flex-col gap-2">
            <label
              htmlFor="region_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Region *
            </label>
            <div className="flex flex-col gap-2">
              <CustomSelect
                id="region_id"
                name="region_id"
                value={formData.region_id}
                onChange={handleInputChange}
                options={
                  loadingRegions
                    ? [{ value: "", label: "Loading regions..." }]
                    : [
                        { value: "", label: "Select Region" },
                        ...regions.map((region) => ({
                          value:
                            region._id?.toString() ||
                            region.id?.toString() ||
                            "",
                          label: region.name,
                        })),
                      ]
                }
                placeholder="Select Region"
                className={
                  errors.region_id ? "border-red-500" : "border-gray-200"
                }
                ariaInvalid={errors.region_id ? "true" : "false"}
              />
              {regionsError && (
                <span className="text-red-500 text-sm mt-1">
                  {regionsError}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  id="is_phinma"
                  name="is_phinma"
                  checked={formData.is_phinma}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="is_phinma"
                  className="ml-2 block text-sm text-gray-700"
                >
                  PHINMA School
                </label>
              </div>
              {errors.is_phinma && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.is_phinma}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </MainModal>
  );
}
