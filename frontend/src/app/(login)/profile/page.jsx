"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { FaUserCircle, FaKey } from "react-icons/fa";

// Import Actions
import {
  updateProfile,
  updatePassword,
} from "@/app/services/auth/profileService";

// Import Components
import ProfileHeader from "./components/ProfileHeader";
import AlertMessage from "./components/AlertMessage";
import ProfileForm from "./components/ProfileForm";
import PasswordForm from "./components/PasswordForm";
import LoadingIndicator from "./components/LoadingIndicator";

import { useProfileData } from "../../services/auth/profileService";

const nameSchema = z
  .string()
  .regex(/^[a-zA-Z\s]*$/, "Only letters and spaces allowed");

const apiLogout = () => {
  console.log("Simulating logout...");
};

export default function Profile() {
  const { profile, profileLoading, profileError, refetchProfile } =
    useProfileData();

  const [delayedLoading, setDelayedLoading] = useState(true);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    middle_name: "",
    username: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [displayUser, setDisplayUser] = useState(null);
  const [clientValidationErrors, setClientValidationErrors] = useState({});
  const [overallStatus, setOverallStatus] = useState({
    type: null,
    message: null,
  });
  // Local state for profile update
  const [isProfilePending, setIsProfilePending] = useState(false);
  const [profileActionState, setProfileActionState] = useState({
    type: null,
    message: null,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayedLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        middle_name: profile.middle_name || "",
        username: profile.username || "",
        currentPassword: prev.currentPassword || "",
        newPassword: prev.newPassword || "",
        confirmPassword: prev.confirmPassword || "",
      }));
      setDisplayUser(profile);
    }
  }, [profile]);

  useEffect(() => {
    if (profileActionState.type === "success") {
      setOverallStatus({
        type: "success",
        message: profileActionState.message,
      });
      setDisplayUser((prev) => ({
        ...prev,
        first_name: formData.first_name,
        last_name: formData.last_name,
        middle_name: formData.middle_name,
        username: formData.username,
      }));
    } else if (profileActionState.type === "error") {
      setOverallStatus({ type: "error", message: profileActionState.message });
    }

    if (
      profileActionState.type === "error" &&
      profileActionState.message?.includes("session")
    ) {
      setOverallStatus({
        type: "error",
        message: "Session expired. Logging out...",
      });
      setTimeout(() => {
        apiLogout();
      }, 2500);
    }
  }, [profileActionState]);

  useEffect(() => {
    if (overallStatus.message) {
      const timer = setTimeout(() => {
        setOverallStatus({ type: null, message: null });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [overallStatus.message]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    let errors = { ...clientValidationErrors };

    if (["first_name", "last_name", "middle_name"].includes(name)) {
      processedValue = value.replace(/[^a-zA-Z\s]/g, "");
      if (value !== processedValue) {
        errors[name] = "Only letters and spaces allowed";
      } else {
        errors[name] = null;
      }
      setDisplayUser((prev) => ({ ...prev, [name]: processedValue }));
    } else if (name === "username") {
      setDisplayUser((prev) => ({ ...prev, [name]: processedValue }));
    } else if (
      ["currentPassword", "newPassword", "confirmPassword"].includes(name)
    ) {
      processedValue = value.replace(/\s+/g, "");
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    setClientValidationErrors(errors);
  };

  // Profile form submit handler
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsProfilePending(true);
    setProfileActionState({ type: null, message: null });
    try {
      const form = e.target;
      const data = new FormData(form);
      const profileData = Object.fromEntries(data.entries());

      if (!profile || !profile._id) {
        throw new Error("User profile data is not available.");
      }

      await updateProfile(profile._id, profileData);
      setProfileActionState({
        type: "success",
        message: "Profile updated successfully.",
      });
      if (typeof refetchProfile === "function") refetchProfile();
    } catch (error) {
      setProfileActionState({
        type: "error",
        message: error.message || "Failed to update profile.",
      });
    } finally {
      setIsProfilePending(false);
    }
  };

  const handlePasswordSuccess = (message) => {
    setOverallStatus({ type: "success", message });
    setFormData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  const handlePasswordError = (message) => {
    if (message !== "Current password is incorrect") {
      setOverallStatus({ type: "error", message });
    }
  };

  if (profileLoading || delayedLoading) {
    return (
      <div className="p-8">
        <LoadingIndicator />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="px-4 py-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-red-800 mb-6">
          User Profile
        </h1>
        <AlertMessage
          message={
            profileError.includes("session")
              ? "Session expired. Please log in again."
              : "Could not load user profile. Please try logging in again."
          }
          type="error"
        />
      </div>
    );
  }

  if (!profile && !profileLoading && !delayedLoading) {
    return (
      <div className="px-4 py-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-red-800 mb-6">
          User Profile
        </h1>
        <AlertMessage message="User profile data not found." type="warning" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-red-800 mb-2">User Profile</h1>
        <p className="text-gray-600">
          Manage your personal information and account settings
        </p>
      </div>

      {overallStatus.message && (
        <div className="mb-6">
          <AlertMessage
            message={overallStatus.message}
            type={overallStatus.type || "info"}
          />
        </div>
      )}

      <div className="space-y-8">
        <ProfileHeader user={displayUser} />

        <section className="bg-white border border-gray-100 rounded-lg">
          <div className="p-6 border-b border-gray-100">
            <h3 className="flex items-center text-xl font-semibold text-gray-900 mb-2">
              <FaUserCircle className="h-6 w-6 mr-3 text-red-700" />
              Personal Information
            </h3>
            <p className="text-sm text-gray-600">
              Keep your personal information up to date.
            </p>
          </div>
          <ProfileForm
            formData={formData}
            user={profile}
            validationErrors={clientValidationErrors}
            handleInputChange={handleInputChange}
            onSubmit={handleProfileSubmit}
            isPending={isProfilePending}
          />
        </section>

        <section className="bg-white border border-gray-100 rounded-lg">
          <div className="p-6 border-b border-gray-100">
            <h3 className="flex items-center text-xl font-semibold text-gray-900 mb-2">
              <FaKey className="h-6 w-6 mr-3 text-red-700" />
              Change Password
            </h3>
            <p className="text-sm text-gray-600">
              Ensure your account is using a secure password.
            </p>
          </div>
          <PasswordForm
            formData={formData}
            user={profile}
            username={profile?.username}
            handleInputChange={handleInputChange}
            onPasswordUpdateSuccess={handlePasswordSuccess}
            onPasswordUpdateError={handlePasswordError}
          />
        </section>
      </div>
    </div>
  );
}
