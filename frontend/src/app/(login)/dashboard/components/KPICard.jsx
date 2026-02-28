"use client";

import React from "react";
import { FaArrowUp, FaArrowDown, FaMinus, FaCircle } from "react-icons/fa";

export default function KPICard({
  title,
  value,
  description,
  icon: Icon,
  iconBgColor = "bg-gray-100",
  iconTextColor = "text-gray-600",
  gradientTo = "to-gray-50",
  loading = false,
}) {
  // Generate a trend indicator based on the title
  const getTrendIcon = () => {
    if (title.toLowerCase().includes("pass"))
      return <FaArrowUp className="w-3 h-3 text-green-500" />;
    if (title.toLowerCase().includes("retake"))
      return <FaArrowDown className="w-3 h-3 text-orange-500" />;
    return <FaMinus className="w-3 h-3 text-gray-400" />;
  };

  return (
    <article className="bg-white rounded-3xl p-6 md:p-8 relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        {Icon && (
          <div
            className={`w-16 h-16 rounded-2xl ${iconBgColor} flex items-center justify-center`}
          >
            <Icon className={`h-8 w-8 ${iconTextColor}`} />
          </div>
        )}
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">
            METRIC
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <span className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight block">
            {loading ? (
              <span className="inline-block h-12 w-24 bg-gray-200 rounded-xl animate-pulse" />
            ) : (
              value
            )}
          </span>
        </div>

        <div className="space-y-3">
          <h3 className="text-base md:text-lg font-semibold text-gray-800">
            {title}
          </h3>
          {description && (
            <div className="flex items-center gap-3">
              <FaCircle className="w-2 h-2 text-red-800" />
              <span className="text-sm text-gray-600">{description}</span>
            </div>
          )}
        </div>
      </div>

      {/* Subtle accent */}
    </article>
  );
}
