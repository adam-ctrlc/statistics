"use client";

import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { X, LoaderCircle } from "@/app/components/icons";
import CustomSelect from "@/app/components/CustomSelect";

// Define Zod schema for validation
const nameSchema = z
  .string()
  .min(1, "Required")
  .regex(/^[a-zA-Z\s]+$/, "Only letters allowed");

// Initial form state structure matching the model + necessary defaults
const initialFormData = {
  first_name: "",
  last_name: "",
  middle_name: "",
  program_id: "",
  school_id: "",
  gender: "",
  took_board_exam: false,
  exam_month_taken: "",
  exam_year_taken: "",
  status: "Pending",
  retake: false,
  retake_times: 0,
};

export default function StudentFormModal({
  isOpen,
  onClose,
  onSubmit,
  student,
  isEditing,
  programs,
  schools,
  fetchRecordById,
  isViewer,
}) {
  const [formLoading, setFormLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  // Effect to load student data when editing or reset form when adding
  useEffect(() => {
    setErrors({});

    if (!isOpen) {
      setFormLoading(false);
      return;
    }

    if (isEditing && student?._id && fetchRecordById && !student.first_name) {
      setFormLoading(true);
      setFormData(initialFormData);

      const loadRecord = async () => {
        try {
          const result = await fetchRecordById(student._id);
          if (!result || result.error) {
            throw new Error(result?.error || "Failed to fetch record");
          }
          const { data } = result;
          const transformedData = {
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            middle_name: data.middle_name || "",
            program_id: data.program_id?._id || data.program_id || "",
            school_id: data.school_id?._id || data.school_id || "",
            gender: data.gender || "",
            took_board_exam: data.took_board_exam || false,
            exam_month_taken: data.exam_month_taken || "",
            exam_year_taken: data.exam_year_taken || "",
            status: data.status || "Pending",
            retake: data.retake || false,
            retake_times: data.retake_times || 0,
          };
          setFormData(transformedData);
        } catch (err) {
          console.error("Error fetching record for modal:", err);
          toast.error(`Failed to load student data: ${err.message}`);
          onClose();
        } finally {
          setFormLoading(false);
        }
      };
      loadRecord();
    } else if (isEditing && student?.first_name) {
      setFormData({
        first_name: student.first_name || "",
        last_name: student.last_name || "",
        middle_name: student.middle_name || "",
        program_id: student.program_id || "",
        school_id: student.school_id || "",
        gender: student.gender || "",
        took_board_exam: student.took_board_exam || false,
        exam_month_taken: student.exam_month_taken || "",
        exam_year_taken: student.exam_year_taken || "",
        status: student.status || "Pending",
        retake: student.retake || false,
        retake_times: student.retake_times || 0,
      });
      setFormLoading(false);
    } else if (!isEditing) {
      setFormData(initialFormData);
      setFormLoading(false);
    }
  }, [student, isEditing, isOpen, fetchRecordById, onClose]);

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let updatedValue = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const newState = { ...prev, [name]: updatedValue };

      // Conditional logic for dependent fields
      if (name === "took_board_exam") {
        if (checked) {
          newState.status = "Passed";
        } else {
          newState.exam_month_taken = "";
          newState.exam_year_taken = "";
          newState.status = "Pending";
        }
      }

      if (name === "retake") {
        if (!checked) {
          newState.retake_times = 0;
        }
      }

      // Ensure retake_times is a number
      if (name === "retake_times") {
        const numValue = parseInt(value, 10);
        newState.retake_times = isNaN(numValue) ? 0 : Math.max(0, numValue); // Ensure non-negative integer
      }

      return newState;
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Basic validation (API handles the robust validation)
  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name) newErrors.first_name = "First name is required";
    if (!formData.last_name) newErrors.last_name = "Last name is required";
    if (!formData.program_id) newErrors.program_id = "Program is required";
    if (!formData.school_id) newErrors.school_id = "School is required";
    if (!formData.gender) newErrors.gender = "Gender is required";

    // Add validation if took_board_exam is true
    if (formData.took_board_exam) {
      if (!formData.exam_month_taken)
        newErrors.exam_month_taken = "Exam month is required if exam was taken";
      if (!formData.exam_year_taken)
        newErrors.exam_year_taken = "Exam year is required if exam was taken";
      if (!["passed", "failed"].includes(formData.status.toLowerCase())) {
        newErrors.status =
          "Status (Passed/Failed) is required if exam was taken";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Ensure boolean types are explicit before submitting
      const dataToSubmit = {
        ...formData,
        took_board_exam: Boolean(formData.took_board_exam),
        retake: Boolean(formData.retake),
        status: formData.took_board_exam ? formData.status : "Pending", // Ensure status follows checkbox state
      };

      // Clear dependent fields if relevant checkbox is false
      if (!dataToSubmit.took_board_exam) {
        dataToSubmit.exam_month_taken = null;
        dataToSubmit.exam_year_taken = null;
        dataToSubmit.retake = false;
        dataToSubmit.retake_times = 0;
      }
      onSubmit(dataToSubmit);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0" aria-hidden="true" />
        </Transition.Child>

        {/* Modal container to center the panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="bg-white rounded-lg border border-gray-300 w-full md:w-[600px] lg:w-[750px] max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
              {/* Header */}
              <header className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                <Dialog.Title
                  as="h2"
                  className="text-xl font-semibold text-gray-800"
                >
                  {isEditing
                    ? "Edit Statistics Record"
                    : "Add New Statistics Record"}
                </Dialog.Title>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </header>

              {/* Form Content */}
              {isViewer && (
                <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-4 rounded">
                  <strong>Viewer Notice:</strong> Viewers cannot add or edit
                  student records.
                </div>
              )}
              {formLoading ? (
                <div className="flex flex-col flex-grow p-6 overflow-y-auto space-y-6 animate-pulse">
                  {/* Personal Information Skeleton */}
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="h-10 bg-gray-200 rounded"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded md:w-1/3"></div>
                  </div>

                  {/* Academic Information Skeleton */}
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="h-10 bg-gray-200 rounded"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  </div>

                  {/* Examination Details Skeleton */}
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-3"></div>
                    <div className="flex items-center gap-2 pt-2">
                      <div className="h-4 w-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                    <div className="space-y-4 pl-6 border-l-2 border-gray-200 ml-2">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center gap-4 pt-4">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                        <div className="h-10 bg-gray-200 rounded flex-grow md:flex-grow-0 md:w-1/3"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col flex-grow overflow-hidden"
                >
                  {/* Scrollable Form Area */}
                  <div className="p-6 overflow-y-auto flex-grow space-y-6">
                    <fieldset className="space-y-4">
                      <legend className="text-lg font-medium text-gray-900 mb-3">
                        Personal Information
                      </legend>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-2">
                          <label
                            htmlFor="first_name"
                            className="block text-sm font-medium text-gray-700"
                          >
                            First Name <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            autoComplete="given-name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            required
                            className={`w-full border p-2.5 rounded-md text-sm ${
                              errors.first_name
                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                            }`}
                          />
                          {errors.first_name && (
                            <p className="text-xs text-red-600">
                              {errors.first_name}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <label
                            htmlFor="middle_name"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Middle Name
                          </label>
                          <input
                            type="text"
                            id="middle_name"
                            name="middle_name"
                            autoComplete="additional-name"
                            value={formData.middle_name}
                            onChange={handleInputChange}
                            className={`w-full border p-2.5 rounded-md text-sm border-gray-300 focus:ring-red-500 focus:border-red-500`}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label
                            htmlFor="last_name"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Last Name <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            autoComplete="family-name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            required
                            className={`w-full border p-2.5 rounded-md text-sm ${
                              errors.last_name
                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                            }`}
                          />
                          {errors.last_name && (
                            <p className="text-xs text-red-600">
                              {errors.last_name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 md:w-1/3">
                        <label
                          htmlFor="gender"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Gender <span className="text-red-600">*</span>
                        </label>
                        <CustomSelect
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          options={[
                            { value: "", label: "Select Gender" },
                            { value: "Male", label: "Male" },
                            { value: "Female", label: "Female" },
                          ]}
                          required
                          className={`w-full border p-2.5 rounded-md text-sm ${
                            errors.gender
                              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                          }`}
                        />
                        {errors.gender && (
                          <p className="text-xs text-red-600">
                            {errors.gender}
                          </p>
                        )}
                      </div>
                    </fieldset>

                    <fieldset className="space-y-4">
                      <legend className="text-lg font-medium text-gray-900 mb-3">
                        Academic Information
                      </legend>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label
                            htmlFor="school_id"
                            className="block text-sm font-medium text-gray-700"
                          >
                            School <span className="text-red-600">*</span>
                          </label>
                          <CustomSelect
                            id="school_id"
                            name="school_id"
                            value={formData.school_id}
                            onChange={handleInputChange}
                            options={[
                              { value: "", label: "Select School" },
                              ...(schools?.map((s) => ({
                                value: s._id,
                                label: s.school,
                              })) || []),
                            ]}
                            required
                            className={`w-full border p-2.5 rounded-md text-sm ${
                              errors.school_id
                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                            }`}
                          />
                          {errors.school_id && (
                            <p className="text-xs text-red-600">
                              {errors.school_id}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <label
                            htmlFor="program_id"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Program <span className="text-red-600">*</span>
                          </label>
                          <CustomSelect
                            id="program_id"
                            name="program_id"
                            value={formData.program_id}
                            onChange={handleInputChange}
                            options={[
                              { value: "", label: "Select Program" },
                              ...(programs?.map((p) => ({
                                value: p._id,
                                label: p.program,
                              })) || []),
                            ]}
                            required
                            className={`w-full border p-2.5 rounded-md text-sm ${
                              errors.program_id
                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                            }`}
                          />
                          {errors.program_id && (
                            <p className="text-xs text-red-600">
                              {errors.program_id}
                            </p>
                          )}
                        </div>
                      </div>
                    </fieldset>

                    <fieldset className="space-y-4">
                      <legend className="text-lg font-medium text-gray-900 mb-3">
                        Examination Details
                      </legend>
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          id="took_board_exam"
                          name="took_board_exam"
                          checked={formData.took_board_exam}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <label
                          htmlFor="took_board_exam"
                          className="text-sm font-medium text-gray-700"
                        >
                          Took Board Exam?
                        </label>
                      </div>

                      {formData.took_board_exam && (
                        <div className="space-y-4 pl-6 border-l-2 border-gray-200 ml-2">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-2">
                              <label
                                htmlFor="exam_month_taken"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Exam Month{" "}
                                <span className="text-red-600">*</span>
                              </label>
                              <CustomSelect
                                id="exam_month_taken"
                                name="exam_month_taken"
                                value={formData.exam_month_taken}
                                onChange={handleInputChange}
                                options={[
                                  { value: "", label: "Select Month" },
                                  { value: "January", label: "January" },
                                  { value: "February", label: "February" },
                                  { value: "March", label: "March" },
                                  { value: "April", label: "April" },
                                  { value: "May", label: "May" },
                                  { value: "June", label: "June" },
                                  { value: "July", label: "July" },
                                  { value: "August", label: "August" },
                                  { value: "September", label: "September" },
                                  { value: "October", label: "October" },
                                  { value: "November", label: "November" },
                                  { value: "December", label: "December" },
                                ]}
                                required={formData.took_board_exam}
                                disabled={!formData.took_board_exam}
                                className={`w-full border p-2.5 rounded-md text-sm ${
                                  errors.exam_month_taken
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } ${
                                  !formData.took_board_exam
                                    ? "bg-gray-100 cursor-not-allowed"
                                    : "focus:ring-red-500 focus:border-red-500"
                                }`}
                              />
                              {errors.exam_month_taken && (
                                <p className="text-xs text-red-600">
                                  {errors.exam_month_taken}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                              <label
                                htmlFor="exam_year_taken"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Exam Year{" "}
                                <span className="text-red-600">*</span>
                              </label>
                              <input
                                type="number"
                                id="exam_year_taken"
                                name="exam_year_taken"
                                autoComplete="off"
                                value={formData.exam_year_taken}
                                onChange={handleInputChange}
                                placeholder="YYYY"
                                min="1900"
                                max={new Date().getFullYear() + 1}
                                required={formData.took_board_exam}
                                disabled={!formData.took_board_exam}
                                className={`w-full border p-2.5 rounded-md text-sm ${
                                  errors.exam_year_taken
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } ${
                                  !formData.took_board_exam
                                    ? "bg-gray-100 cursor-not-allowed"
                                    : "focus:ring-red-500 focus:border-red-500"
                                }`}
                              />
                              {errors.exam_year_taken && (
                                <p className="text-xs text-red-600">
                                  {errors.exam_year_taken}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                              <label
                                htmlFor="status"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Status <span className="text-red-600">*</span>
                              </label>
                              <CustomSelect
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                options={[
                                  { value: "Passed", label: "Passed" },
                                  { value: "Failed", label: "Failed" },
                                ]}
                                required={formData.took_board_exam}
                                disabled={!formData.took_board_exam}
                                className={`w-full border p-2.5 rounded-md text-sm ${
                                  errors.status
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } ${
                                  !formData.took_board_exam
                                    ? "bg-gray-100 cursor-not-allowed"
                                    : "focus:ring-red-500 focus:border-red-500"
                                }`}
                              />
                              {errors.status && (
                                <p className="text-xs text-red-600">
                                  {errors.status}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row md:items-center gap-4 pt-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="retake"
                                name="retake"
                                checked={formData.retake}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                              />
                              <label
                                htmlFor="retake"
                                className="text-sm font-medium text-gray-700"
                              >
                                Retaker?
                              </label>
                            </div>
                            <div className="flex flex-col gap-2 flex-grow md:flex-grow-0 md:w-1/3">
                              <label
                                htmlFor="retake_times"
                                className={`block text-sm font-medium ${
                                  formData.retake
                                    ? "text-gray-700"
                                    : "text-gray-400"
                                }`}
                              >
                                Number of Retakes
                              </label>
                              <input
                                type="number"
                                id="retake_times"
                                name="retake_times"
                                autoComplete="off"
                                value={formData.retake_times}
                                onChange={handleInputChange}
                                min="0"
                                step="1"
                                disabled={!formData.retake}
                                className={`w-full border p-2.5 rounded-md text-sm border-gray-300 ${
                                  !formData.retake
                                    ? "bg-gray-100 cursor-not-allowed"
                                    : "focus:ring-red-500 focus:border-red-500"
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </fieldset>
                  </div>

                  {/* Footer */}
                  <footer className="sticky bottom-0 bg-gray-50 z-10 px-6 py-4 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
                    {/* Cancel and Submit buttons */}
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isViewer}
                      aria-disabled={isViewer}
                      title={
                        isViewer
                          ? "Viewers cannot add or edit records"
                          : isEditing
                          ? "Update Record"
                          : "Add Record"
                      }
                    >
                      {isEditing ? "Update Record" : "Add Record"}
                    </button>
                  </footer>
                </form>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
