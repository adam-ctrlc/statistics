"use client";

import React from "react";
import { AlertCircle } from "@/app/components/icons";

export default function ErrorAlert({ error, onRetry }) {
  if (!error) return null;

  return (
    <div
      className="border-l-4 border-red-600 bg-red-50 text-red-800 px-4 py-4 md:px-6 md:py-4 rounded-md mb-10 flex items-start gap-3"
      role="alert"
    >
      <AlertCircle
        className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0"
        aria-hidden="true"
      />
      <div>
        <h3 className="font-semibold text-red-800 text-lg">
          Failed to load data
        </h3>
        <p className="text-red-700 mt-1 text-sm md:text-base">
          {error ||
            "Cannot connect to the server. Please refresh the page or try again later."}
        </p>
        {onRetry && (
          <button
            className="mt-3 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
            onClick={onRetry}
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
