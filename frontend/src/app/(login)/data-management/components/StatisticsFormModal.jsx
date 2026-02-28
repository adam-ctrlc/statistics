"use client";
import { useState, useEffect } from "react";
import MainModal from "./MainModal";
import CustomSelect from "@/app/components/CustomSelect";
import { programService } from "../../../services/dataManagement/programService";
import { schoolService } from "../../../services/dataManagement/schoolService";

export default function StatisticsFormModal({
  isOpen,
  onClose,
  onSubmit,
  statistic,
  isEditing,
}) {
  // Initialize form state
  const [formData, setFormData] = useState({
    program_id: "",
    school_id: "",
    year: new Date().getFullYear().toString(),
    passing_rate: "",
    failing_rate: "",
  });

  const [errors, setErrors] = useState({});
  const [programs, setPrograms] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState(null);

  // Reset form when statistic changes or modal opens
  useEffect(() => {
    if (isEditing && statistic) {
      setFormData({
        program_id: statistic.program_id,
        school_id: statistic.school_id,
        year: statistic.year
          ? statistic.year.toString()
          : new Date().getFullYear().toString(),
        passing_rate: statistic.passing_rate,
        failing_rate: statistic.failing_rate,
      });
    } else {
      // Default values for new statistic
      setFormData({
        program_id: "",
        school_id: "",
        year: new Date().getFullYear().toString(),
        passing_rate: "",
        failing_rate: "",
      });
    }
    // Clear any errors
    setErrors({});
  }, [statistic, isEditing, isOpen]);

  useEffect(() => {
    async function fetchOptions() {
      setLoadingOptions(true);
      setOptionsError(null);
      try {
        const [programsRes, schoolsRes] = await Promise.all([
          programService.getAll(),
          schoolService.getAll(),
        ]);
        setPrograms(programsRes.data || []);
        setSchools(schoolsRes.data || []);
      } catch (err) {
        setOptionsError("Failed to load program/school options.");
        setPrograms([]);
        setSchools([]);
      } finally {
        setLoadingOptions(false);
      }
    }
    if (isOpen) fetchOptions();
  }, [isOpen]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "year") {
      // Only allow numeric input for year
      if (value === "" || /^\d+$/.test(value)) {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    } else if (name === "passing_rate") {
      // Update failing rate automatically to ensure they sum to 100
      const passingRate = parseFloat(value) || 0;
      const failingRate = 100 - passingRate;

      setFormData({
        ...formData,
        [name]: value,
        failing_rate: failingRate.toString(),
      });
    } else if (name === "failing_rate") {
      // Update passing rate automatically to ensure they sum to 100
      const failingRate = parseFloat(value) || 0;
      const passingRate = 100 - failingRate;

      setFormData({
        ...formData,
        [name]: value,
        passing_rate: passingRate.toString(),
      });
    } else {
      // For other fields, just update normally
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Validate the form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.program_id) {
      newErrors.program_id = "Program is required";
    }

    if (!formData.school_id) {
      newErrors.school_id = "School is required";
    }

    if (!formData.year) {
      newErrors.year = "Year is required";
    } else if (
      !/^\d{4}$/.test(formData.year) ||
      parseInt(formData.year) < 1900 ||
      parseInt(formData.year) > new Date().getFullYear() + 5
    ) {
      newErrors.year = "Please enter a valid 4-digit year";
    }

    const passingRate = parseFloat(formData.passing_rate);
    if (isNaN(passingRate) || passingRate < 0 || passingRate > 100) {
      newErrors.passing_rate = "Passing rate must be between 0 and 100";
    }

    const failingRate = parseFloat(formData.failing_rate);
    if (isNaN(failingRate) || failingRate < 0 || failingRate > 100) {
      newErrors.failing_rate = "Failing rate must be between 0 and 100";
    }

    if (passingRate + failingRate !== 100) {
      newErrors.failing_rate = "Passing and failing rates must sum to 100%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Convert string values to appropriate types
      const formattedData = {
        ...formData,
        program_id: parseInt(formData.program_id),
        school_id: parseInt(formData.school_id),
        year: formData.year, // Keep as string to match schema
        passing_rate: parseFloat(formData.passing_rate),
        failing_rate: parseFloat(formData.failing_rate),
      };
      onSubmit(formattedData);
    }
  };

  // Generate year options for the last 10 years
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 10; i++) {
      years.push(currentYear - i);
    }
    return years;
  };

  if (!isOpen) return null;

  return (
    <MainModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Statistic" : "Add New Statistic"}
      isEditing={isEditing}
      isPending={loadingOptions} // Pass loading state to MainModal for submit button
    >
      {loadingOptions ? (
        <div className="p-6 space-y-6 animate-pulse">
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="statistics-form">
          {/* Program Selection */}
          <div className="mb-4">
            <label
              htmlFor="program_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Program *
            </label>
            <CustomSelect
              id="program_id"
              name="program_id"
              value={formData.program_id}
              onChange={handleChange}
              options={
                loadingOptions
                  ? [{ value: "", label: "Loading programs..." }]
                  : [
                      { value: "", label: "Select Program" },
                      ...programs.map((program) => ({
                        value:
                          program._id?.toString() ||
                          program.id?.toString() ||
                          "",
                        label: program.program,
                      })),
                    ]
              }
              placeholder="Select a program"
              className={
                errors.program_id ? "border-red-500" : "border-gray-200"
              }
              ariaInvalid={errors.program_id ? "true" : "false"}
            />
            {optionsError && (
              <p className="mt-1 text-red-500 text-sm">{optionsError}</p>
            )}
            {errors.program_id && (
              <p className="mt-1 text-red-500 text-sm">{errors.program_id}</p>
            )}
          </div>

          {/* School Selection */}
          <div className="mb-4">
            <label
              htmlFor="school_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              School *
            </label>
            <CustomSelect
              id="school_id"
              name="school_id"
              value={formData.school_id}
              onChange={handleChange}
              options={
                loadingOptions
                  ? [{ value: "", label: "Loading schools..." }]
                  : [
                      { value: "", label: "Select School" },
                      ...schools.map((school) => ({
                        value:
                          school._id?.toString() || school.id?.toString() || "",
                        label: school.school,
                      })),
                    ]
              }
              placeholder="Select a school"
              className={
                errors.school_id ? "border-red-500" : "border-gray-200"
              }
              ariaInvalid={errors.school_id ? "true" : "false"}
            />
            {optionsError && (
              <p className="mt-1 text-red-500 text-sm">{optionsError}</p>
            )}
            {errors.school_id && (
              <p className="mt-1 text-red-500 text-sm">{errors.school_id}</p>
            )}
          </div>

          {/* Year */}
          <div className="mb-4">
            <label
              htmlFor="year"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Year *
            </label>
            <input
              type="text"
              id="year"
              name="year"
              autoComplete="off"
              value={formData.year}
              onChange={handleChange}
              className={`w-full border ${
                errors.year ? "border-red-500" : "border-gray-200"
              } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500`}
              pattern="\d{4}"
              maxLength="4"
              placeholder="YYYY"
              required
            />
            {errors.year && (
              <p className="mt-1 text-red-500 text-sm">{errors.year}</p>
            )}
          </div>

          {/* Passing Rate */}
          <div className="mb-4">
            <label
              htmlFor="passing_rate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Passing Rate (%) *
            </label>
            <input
              type="number"
              id="passing_rate"
              name="passing_rate"
              autoComplete="off"
              value={formData.passing_rate}
              onChange={handleChange}
              placeholder="Enter passing rate"
              min="0"
              max="100"
              step="0.01"
              className={`w-full border ${
                errors.passing_rate ? "border-red-500" : "border-gray-200"
              } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500`}
              required
            />
            {errors.passing_rate && (
              <p className="mt-1 text-red-500 text-sm">{errors.passing_rate}</p>
            )}
          </div>

          {/* Failing Rate */}
          <div className="mb-4">
            <label
              htmlFor="failing_rate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Failing Rate (%) *
            </label>
            <input
              type="number"
              id="failing_rate"
              name="failing_rate"
              autoComplete="off"
              value={formData.failing_rate}
              onChange={handleChange}
              placeholder="Enter failing rate"
              min="0"
              max="100"
              step="0.01"
              className={`w-full border ${
                errors.failing_rate ? "border-red-500" : "border-gray-200"
              } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500`}
              required
            />
            {errors.failing_rate && (
              <p className="mt-1 text-red-500 text-sm">{errors.failing_rate}</p>
            )}
            <p className="mt-1 text-gray-500 text-sm">
              Note: Passing and failing rates should sum to 100%
            </p>
          </div>
        </form>
      )}
    </MainModal>
  );
}
