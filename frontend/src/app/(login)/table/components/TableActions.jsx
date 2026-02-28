"use client";

import React from "react";
import { Plus, Upload, Download } from "@/app/components/icons";
import ColumnSelector from "./ColumnSelector"; // Import existing component

// Functional component using React 18/19 style
const TableActions = ({
  onAddStudent,
  onImportClick, // Renamed for clarity
  onExportClick, // Renamed for clarity
  onFileChange, // Handler for the hidden file input
  isExportDisabled,
  columnsForSelector, // Pass the list of columns for the selector
  columnVisibility,
  setColumnVisibility,
  table, // Pass table instance if ColumnSelector needs it
  isViewer = false,
}) => {
  return (
    <section
      className="flex flex-col md:flex-row flex-wrap justify-between items-center mb-8 gap-4"
      aria-label="Table Actions"
    >
      {/* Left Aligned Actions */}
      <div className="flex flex-wrap gap-4">
        {/* Add Student Button */}
        <button
          className={`bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
          onClick={isViewer ? undefined : onAddStudent}
          disabled={isViewer}
          aria-disabled={isViewer}
          title={isViewer ? "Viewers cannot add students" : "Add Student"}
        >
          <Plus size={16} />
          Add Student
        </button>

        {/* Import Excel Button */}
        <button
          className={`border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
          onClick={isViewer ? undefined : onImportClick}
          disabled={isViewer}
          aria-disabled={isViewer}
          title={isViewer ? "Viewers cannot import records" : "Import Excel"}
        >
          <Upload size={16} />
          Import Excel
        </button>

        {/* Column Selector - Using the existing component */}
        <ColumnSelector
          columns={columnsForSelector} // Pass the simplified list for toggling
          columnVisibility={columnVisibility}
          setColumnVisibility={setColumnVisibility}
          table={table} // Pass table instance
        />
      </div>

      {/* Hidden File Input for Import */}
      <input
        type="file"
        id="excel-upload"
        accept=".xlsx, .xls"
        className="hidden"
        onChange={onFileChange}
      />

      {/* Right Aligned Actions */}
      {/* Export Excel Button */}
      <button
        className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onExportClick}
        disabled={isExportDisabled}
      >
        <Download size={16} />
        {/* Add loading state indication if needed */}
        Export Excel
      </button>
    </section>
  );
};

export default TableActions;
