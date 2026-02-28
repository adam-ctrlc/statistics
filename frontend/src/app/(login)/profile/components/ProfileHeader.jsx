"use client";

import React from "react";
import { FaUser, FaUserCog, FaGraduationCap, FaSchool } from "react-icons/fa";

export default function ProfileHeader({ user }) {
  if (!user) return null;

  const role = user.role_id?.role || "Role N/A";
  const program = user.program_id?.program || "Program N/A";
  const department = user.program_id?.department_id?.name || "Department N/A";
  const school = user.school_id?.school || "School N/A";
  const status = user.status || "inactive";

  return (
    <section className="bg-white border border-gray-100 rounded-lg overflow-hidden">
      {/* Header Banner */}
      <div className="bg-red-700 px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-white">
          {/* Left Side - Avatar, Name and Status */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 mx-auto md:mx-0">
              <FaUser className="h-10 w-10 text-white" />
            </div>

            {/* Name, Role and Status */}
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold mb-1">
                {user.first_name || ""} {user.middle_name || ""}{" "}
                {user.last_name || ""}
              </h2>

              <p className="text-white/90 text-base font-medium mb-3">
                {role
                  .split(" ")
                  .map(
                    (word) =>
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  )
                  .join(" ")}
              </p>

              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    status === "active" ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </div>
            </div>
          </div>

          {/* Right Side - Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Program Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <FaGraduationCap className="h-4 w-4 text-white/80" />
                <span className="text-xs font-medium text-white/80">
                  Program
                </span>
              </div>
              <p className="font-semibold text-white text-xs mb-1">{program}</p>
              <p className="text-xs text-white/70">{department}</p>
            </div>

            {/* School Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <FaSchool className="h-4 w-4 text-white/80" />
                <span className="text-xs font-medium text-white/80">
                  School
                </span>
              </div>
              <p className="font-semibold text-white text-xs">{school}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
