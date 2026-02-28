"use client";

import { useState, useEffect, useMemo } from "react";
import { useFormStatus } from "react-dom";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  X,
  Save,
  UserCircle,
  KeyRound,
  Briefcase,
  School,
  BookCopy,
  ShieldCheck,
  Info,
} from "@/app/components/icons";
import AlertMessage from "@/app/(login)/profile/components/AlertMessage"; // Reuse alert
import MainModal from "./MainModal"; // Import MainModal
import CustomSelect from "@/app/components/CustomSelect";
import { roleService } from "../../../services/dataManagement/roleService";
import { schoolService } from "../../../services/dataManagement/schoolService";
import { programService } from "../../../services/dataManagement/programService";
import { userService } from "../../../services/dataManagement/userService";

// Define Zod schemas for validation
const nameSchema = z
  .string()
  .min(1, "This field is required")
  .regex(/^[a-zA-Z\s]+$/, "Only letters and spaces are allowed");
const middleNameSchema = z
  .string()
  .regex(/^[a-zA-Z\s]*$/, "Only letters and spaces are allowed")
  .optional();
const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters");
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

// Submit Button Component
function SubmitButton({ isEditing, disabled }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
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
          {isEditing ? "Update User" : "Add User"}
        </>
      )}
    </button>
  );
}

export default function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  isEditing,
  modalClassName,
  fieldErrors = {},
}) {
  const [formData, setFormData] = useState({});
  const [clientErrors, setClientErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [roles, setRoles] = useState([]);
  const [schools, setSchools] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState(null);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);
  const [usernameCheckError, setUsernameCheckError] = useState("");
  const [usernameManuallyEdited, setUsernameManuallyEdited] = useState(false);

  const normalizeGender = (value) => {
    if (!value) return "";
    const lower = value.toLowerCase();
    if (lower === "male") return "Male";
    if (lower === "female") return "Female";
    return value;
  };

  const isTargetAdmin =
    isEditing && user?.role_id?.role?.toLowerCase?.() === "admin";

  const roleOptions = useMemo(() => {
    const normalized = roles || [];
    if (isTargetAdmin) {
      return normalized
        .filter((r) => (r.role || "").toLowerCase() === "admin")
        .map((r) => ({
          value: r._id?.toString() || r.id?.toString() || "",
          label: r.role,
        }));
    }

    return normalized
      .filter((r) => (r.role || "").toLowerCase() !== "admin")
      .map((r) => ({
        value: r._id?.toString() || r.id?.toString() || "",
        label: r.role,
      }));
  }, [roles, isTargetAdmin]);

  const generateUsername = (firstName, lastName, middleName) => {
    const clean = (value) =>
      (value || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .trim()
        .replace(/\s+/g, "");

    const first = clean(firstName);
    const last = clean(lastName);
    const middle = clean(middleName);
    const middleInitial = middle ? middle[0] : "";

    const generated = [first, middleInitial, last].filter(Boolean).join(".");
    return generated || "user";
  };

  useEffect(() => {
    async function fetchOptions() {
      setLoadingOptions(true);
      setOptionsError(null);
      try {
        const [rolesRes, schoolsRes, programsRes] = await Promise.all([
          roleService.getAll(),
          schoolService.getAll(),
          programService.getAll(),
        ]);
        setRoles(rolesRes.data || []);
        setSchools(schoolsRes.data || []);
        setPrograms(programsRes.data || []);
      } catch (err) {
        setOptionsError("Failed to load select options.");
        setRoles([]);
        setSchools([]);
        setPrograms([]);
      } finally {
        setLoadingOptions(false);
      }
    }
    if (isOpen) fetchOptions();
  }, [isOpen]);

  // Initialize form data when user or isOpen changes
  useEffect(() => {
    if (isOpen) {
      const initialData =
        isEditing && user
          ? {
              id: user._id || user.id,
              first_name: user.first_name || "",
              last_name: user.last_name || "",
              middle_name: user.middle_name || "",
              username: user.username || "",
              password: "", // Always clear password field on open
              gender: normalizeGender(user.gender),
              school_id: (
                user.school_id?._id ||
                user.school_id?.id ||
                user.school_id ||
                ""
              ).toString(),
              program_id: (
                user.program_id?._id ||
                user.program_id?.id ||
                user.program_id ||
                ""
              ).toString(),
              role_id: (
                user.role_id?._id ||
                user.role_id?.id ||
                user.role_id ||
                ""
              ).toString(),
              status: user.status || "inactive",
            }
          : {
              first_name: "",
              last_name: "",
              middle_name: "",
              username: "",
              password: "",
              gender: "",
              school_id: "",
              program_id: "",
              role_id: "",
              status: "inactive",
            };
      setFormData(initialData);
      setUsernameManuallyEdited(Boolean(isEditing));
      setClientErrors({}); // Clear client errors on open
      setShowPassword(false); // Ensure password hidden on open
    }
  }, [user, isEditing, isOpen]);

  useEffect(() => {
    if (!isOpen || usernameManuallyEdited) {
      return;
    }

    const autoUsername = generateUsername(
      formData.first_name,
      formData.last_name,
      formData.middle_name
    );

    setFormData((prev) => ({
      ...prev,
      username: autoUsername,
    }));
  }, [
    formData.first_name,
    formData.last_name,
    formData.middle_name,
    isOpen,
    usernameManuallyEdited,
  ]);

  // Set default select values to first option after options are loaded
  useEffect(() => {
    if (isOpen && !loadingOptions) {
      setFormData((prev) => {
        let changed = false;
        const updated = { ...prev };
        if (
          (!updated.role_id ||
            !roleOptions.some(
              (r) => r.value === updated.role_id
            )) &&
          roleOptions.length > 0
        ) {
          updated.role_id = roleOptions[0].value;
          changed = true;
        }
        if (
          (!updated.school_id ||
            !schools.some(
              (s) =>
                (s._id?.toString() || s.id?.toString()) === updated.school_id
            )) &&
          schools.length > 0
        ) {
          updated.school_id =
            schools[0]._id?.toString() || schools[0].id?.toString() || "";
          changed = true;
        }
        if (
          (!updated.program_id ||
            !programs.some(
              (p) =>
                (p._id?.toString() || p.id?.toString()) === updated.program_id
            )) &&
          programs.length > 0
        ) {
          updated.program_id =
            programs[0]._id?.toString() || programs[0].id?.toString() || "";
          changed = true;
        }
        return changed ? updated : prev;
      });
    }
  }, [isOpen, loadingOptions, roleOptions, schools, programs]);

  // Client-side validation on input change (for instant feedback)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let currentErrors = { ...clientErrors };
    let processedValue = value;

    // Basic sanitization/validation for instant feedback
    if (["first_name", "last_name", "middle_name"].includes(name)) {
      processedValue = value.replace(/[^a-zA-Z\s]/g, "");
      try {
        nameSchema.parse(processedValue);
        delete currentErrors[name];
      } catch (err) {
        currentErrors[name] = err.errors[0].message;
      }
      if (name === "middle_name" && !processedValue) delete currentErrors[name]; // Optional field
    }
    if (name === "username") {
      setUsernameManuallyEdited(true);
      try {
        usernameSchema.parse(value);
        delete currentErrors[name];
      } catch (err) {
        currentErrors[name] = err.errors[0].message;
      }
    }
    if (name === "password" && value) {
      // Only validate password if user types something
      try {
        passwordSchema.parse(value);
        delete currentErrors[name];
      } catch (err) {
        currentErrors[name] = err.errors[0].message;
      }
    }
    // Reset server error message if user starts typing in a field
    // This requires mapping server errors to field names, or just clearing the general message

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    setClientErrors(currentErrors);
  };

  // Check if form is valid on the client side before enabling submit
  // This is optional but provides better UX than relying solely on server validation
  const isFormValid = () => {
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.username ||
      !formData.role_id ||
      !formData.school_id ||
      !formData.program_id ||
      !formData.gender
    )
      return false;
    if ((!isEditing || formData.password) && !formData.password) return false;
    if (Object.values(clientErrors).some((err) => !!err)) return false;
    if (Object.values(fieldErrors).some((err) => !!err)) return false;
    if (!usernameAvailable) return false;
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEditing) {
      onSubmit(formData.id, formData);
    } else {
      onSubmit(formData);
    }
  };

  // Debounced username check
  useEffect(() => {
    if (!formData.username) {
      setUsernameAvailable(true);
      setUsernameCheckError("");
      return;
    }
    const handler = setTimeout(async () => {
      setUsernameCheckLoading(true);
      const res = await userService.checkUsername(
        formData.username,
        isEditing ? formData.id : undefined
      );
      setUsernameCheckLoading(false);
      if (res.exists) {
        setUsernameAvailable(false);
        setUsernameCheckError("Username already exists");
      } else {
        setUsernameAvailable(true);
        setUsernameCheckError("");
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [formData.username, isEditing, formData.id]);

  // Show loading state if editing and user data is not yet loaded
  if (isEditing && !user) {
    return (
      <MainModal isOpen={isOpen} onClose={onClose} title="Edit User" isEditing>
        <div className="flex flex-col flex-grow p-6 space-y-6 animate-pulse">
          {/* Personal Information Skeleton */}
          <div className="mb-6">
            <div className="h-6 bg-gray-200 rounded w-48 mb-3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Account Information Skeleton */}
          <div className="mb-6">
            <div className="h-6 bg-gray-200 rounded w-48 mb-3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Additional Information Skeleton */}
          <div className="mb-6">
            <div className="h-6 bg-gray-200 rounded w-48 mb-3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="flex items-center gap-2 mt-6">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
          </div>

          {/* Role and Affiliation Skeleton */}
          <div className="mb-6">
            <div className="h-6 bg-gray-200 rounded w-48 mb-3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </MainModal>
    );
  }

  if (!isOpen) return null;

  return (
    <MainModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit User" : "Add New User"}
      isEditing={isEditing}
      className={modalClassName}
      formId="user-form-modal-form"
      isPending={loadingOptions || !isFormValid()}
      onSubmit={handleSubmit}
    >
      {/* Body - Scrollable */}
      <div className="bg-white rounded-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-2 space-y-5 overflow-y-auto flex-grow">
          {optionsError && <AlertMessage message={optionsError} type="error" />}
          {isEditing && (
            <input type="hidden" name="id" value={formData.id || ""} />
          )}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              Personal Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="first_name"
                  className="text-sm font-medium text-gray-700"
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  autoComplete="given-name"
                  value={formData.first_name || ""}
                  onChange={handleInputChange}
                  required
                  className={`input-field w-full border ${
                    clientErrors.first_name
                      ? "border-red-500"
                      : "border-gray-200"
                  } rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                />
                {clientErrors.first_name && (
                  <p className="text-xs text-red-500">
                    {clientErrors.first_name}
                  </p>
                )}
              </div>
              {/* Last Name */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="last_name"
                  className="text-sm font-medium text-gray-700"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  autoComplete="family-name"
                  value={formData.last_name || ""}
                  onChange={handleInputChange}
                  required
                  className={`input-field w-full border ${
                    clientErrors.last_name
                      ? "border-red-500"
                      : "border-gray-200"
                  } rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                />
                {clientErrors.last_name && (
                  <p className="text-xs text-red-500">
                    {clientErrors.last_name}
                  </p>
                )}
              </div>
              {/* Middle Name */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="middle_name"
                  className="text-sm font-medium text-gray-700"
                >
                  Middle Name
                </label>
                <input
                  type="text"
                  id="middle_name"
                  name="middle_name"
                  autoComplete="additional-name"
                  value={formData.middle_name || ""}
                  onChange={handleInputChange}
                  className={`input-field w-full border ${
                    clientErrors.middle_name
                      ? "border-red-500"
                      : "border-gray-200"
                  } rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                />
                {clientErrors.middle_name && (
                  <p className="text-xs text-red-500">
                    {clientErrors.middle_name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Account Information Section */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              Account Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="username"
                  className="text-sm font-medium text-gray-700"
                >
                  Username (auto-generated) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  autoComplete="username"
                  value={formData.username || ""}
                  onChange={handleInputChange}
                  required
                  className={`input-field w-full border ${
                    clientErrors.username ? "border-red-500" : "border-gray-200"
                  } rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                />
                <p className="text-xs text-gray-500">
                  Generated from name. You can still edit it.
                </p>
                {clientErrors.username && (
                  <p className="text-xs text-red-500">
                    {clientErrors.username}
                  </p>
                )}
                {fieldErrors.username && (
                  <p className="text-xs text-red-500">{fieldErrors.username}</p>
                )}
                {!usernameAvailable && usernameCheckError && (
                  <p className="text-xs text-red-500">{usernameCheckError}</p>
                )}
                {usernameCheckLoading && (
                  <p className="text-xs text-gray-500">Checking username...</p>
                )}
              </div>
              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 flex items-center gap-1"
                >
                  Password{" "}
                  {isEditing ? (
                    "(Optional - leave blank to keep current)"
                  ) : (
                    <span className="text-red-500">*</span>
                  )}
                  <Info
                    className="h-3.5 w-3.5 text-gray-400 cursor-help"
                    title="Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char"
                  />
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    autoComplete={isEditing ? "new-password" : "new-password"}
                    value={formData.password || ""}
                    onChange={handleInputChange}
                    required={!isEditing} // Only required when adding
                    className={`input-field w-full border ${
                      clientErrors.password
                        ? "border-red-500"
                        : "border-gray-200"
                    } rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent pl-10 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {clientErrors.password && (
                  <p className="text-xs text-red-500">
                    {clientErrors.password}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              Additional Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Gender */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="gender"
                  className="text-sm font-medium text-gray-700"
                >
                  Gender
                </label>
                <CustomSelect
                  id="gender"
                  name="gender"
                  value={formData.gender || ""}
                  onChange={handleInputChange}
                   options={[
                     { value: "", label: "Select Gender" },
                     { value: "Male", label: "Male" },
                     { value: "Female", label: "Female" },
                   ]}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="status"
                  className="text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <CustomSelect
                  id="status"
                  name="status"
                  value={formData.status || "inactive"}
                  onChange={handleInputChange}
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ]}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Role and Affiliation Section */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              Role and Affiliation
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Role */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="role_id"
                  className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
                >
                  <ShieldCheck className="h-4 w-4 text-gray-400" /> Role{" "}
                  <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  id="role_id"
                  name="role_id"
                  value={formData.role_id || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => ({ ...prev, role_id: value }));
                  }}
                  disabled={isTargetAdmin}
                  options={
                    loadingOptions
                      ? [{ value: "", label: "Loading roles..." }]
                      : [
                          {
                            value: "",
                            label: isTargetAdmin
                              ? "Admin role is locked"
                              : "Select Role",
                            disabled: true,
                          },
                          ...roleOptions,
                        ]
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {isTargetAdmin && (
                  <p className="text-xs text-gray-500">
                    Admin users keep their admin role.
                  </p>
                )}
              </div>
              {/* School */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="school_id"
                  className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
                >
                  <School className="h-4 w-4 text-gray-400" /> School
                </label>
                <CustomSelect
                  id="school_id"
                  name="school_id"
                  value={formData.school_id || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => ({ ...prev, school_id: value }));
                  }}
                  options={
                    loadingOptions
                      ? [{ value: "", label: "Loading schools..." }]
                      : [
                          { value: "", label: "Select School", disabled: true },
                          ...schools.map((s) => ({
                            value: s._id?.toString() || s.id?.toString() || "",
                            label: s.school,
                          })),
                        ]
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              {/* Program */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="program_id"
                  className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
                >
                  <BookCopy className="h-4 w-4 text-gray-400" /> Program
                </label>
                <CustomSelect
                  id="program_id"
                  name="program_id"
                  value={formData.program_id || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => ({ ...prev, program_id: value }));
                  }}
                  options={
                    loadingOptions
                      ? [{ value: "", label: "Loading programs..." }]
                      : [
                          {
                            value: "",
                            label: "Select Program",
                            disabled: true,
                          },
                          ...programs.map((p) => ({
                            value: p._id?.toString() || p.id?.toString() || "",
                            label: p.program,
                          })),
                        ]
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainModal>
  );
}
