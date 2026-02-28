import React, { useState, useRef, useEffect, useId } from "react";
import { FaCog } from "react-icons/fa";

const ColumnSelector = ({ columns, columnVisibility, setColumnVisibility }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const baseId = useId();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleColumnToggle = (columnId) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  // Prevent hiding all columns
  const isDisabled = (columnId) => {
    const currentlyVisibleCount =
      Object.values(columnVisibility).filter(Boolean).length;
    return columnVisibility[columnId] && currentlyVisibleCount <= 1;
  };

  return (
    <div className="relative inline-block text-left z-20" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls="column-toggle-menu"
      >
        <FaCog className="mr-2" />
        Columns
      </button>

      {isOpen && (
        <div
          id="column-toggle-menu"
          className="origin-top-right absolute right-0 mt-2 w-48 rounded-md bg-white ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-50 border border-gray-200"
        >
          <div
            className="py-1 overflow-y-auto max-h-72"
            role="group"
            aria-labelledby="column-toggle-heading"
          >
            <div
              id="column-toggle-heading"
              className="px-4 py-2 text-xs font-semibold text-gray-700"
            >
              Toggle Columns
            </div>
            {columns.map((column) => (
              <div
                key={column.id}
                className={`px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center ${
                  isDisabled(column.id)
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <label
                  htmlFor={`${baseId}-column-${column.id}`}
                  className="flex items-center w-full cursor-pointer"
                >
                  <input
                    id={`${baseId}-column-${column.id}`}
                    name={`${baseId}-column-${column.id}`}
                    type="checkbox"
                    checked={columnVisibility[column.id]}
                    onChange={() => handleColumnToggle(column.id)}
                    disabled={isDisabled(column.id)}
                    className={`h-4 w-4 mr-2 rounded border-gray-300 focus:ring-red-500 ${
                      isDisabled(column.id)
                        ? "cursor-not-allowed"
                        : "text-red-600"
                    }`}
                  />
                  <span>{column.label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnSelector;
