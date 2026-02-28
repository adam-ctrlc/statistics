import React, { useState, useRef, useEffect, useId } from "react";
import { FaChevronDown } from "react-icons/fa";

const MultiSelectDropdown = ({
  id,
  options = [],
  selectedValues = [],
  onChange,
  placeholder = "Select options",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const baseId = useId();

  // Close dropdown when clicking outside
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

  const handleOptionClick = (value) => {
    let newSelectedValues;
    // Get values of all actual options (excluding the one with value '')
    const allActualOptionValues = options
      .filter((opt) => opt.value !== "")
      .map((opt) => opt.value);

    if (value === "") {
      // Clicked the "All" option
      // Check if all actual options are currently selected
      const allCurrentlySelected =
        allActualOptionValues.length > 0 && // Ensure there are options to select
        allActualOptionValues.every((optVal) =>
          selectedValues.includes(optVal)
        );

      if (allCurrentlySelected) {
        // If all were selected, deselect everything
        newSelectedValues = [];
      } else {
        // If not all were selected (or none), select all actual options
        newSelectedValues = [...allActualOptionValues];
      }
    } else {
      // Clicked a regular option
      if (selectedValues.includes(value)) {
        // Remove the value if it's already selected
        newSelectedValues = selectedValues.filter((item) => item !== value);
      } else {
        // Add the value if it's not selected
        newSelectedValues = [...selectedValues, value];
      }
    }

    // Call the onChange function with the new values
    onChange(newSelectedValues);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;

    // Determine all actual option values (excluding '')
    const allActualOptionValues = options
      .filter((opt) => opt.value !== "")
      .map((opt) => opt.value);

    // Check if all actual options are selected
    const allSelected =
      allActualOptionValues.length > 0 &&
      allActualOptionValues.every((optVal) => selectedValues.includes(optVal));

    if (allSelected) {
      // Find the "All" option label if it exists
      const allOption = options.find((opt) => opt.value === "");
      if (allOption) return allOption.label; // Display "All Programs", "All Schools", etc.
    }

    if (selectedValues.length === 1) {
      const option = options.find((opt) => opt.value === selectedValues[0]);
      return option ? option.label : placeholder;
    }

    return `${selectedValues.length} items selected`;
  };

  // Determine all actual option values outside map for efficiency
  const allActualOptionValues = options
    .filter((opt) => opt.value !== "")
    .map((opt) => opt.value);
  const areAllActualOptionsSelected =
    allActualOptionValues.length > 0 &&
    allActualOptionValues.every((val) => selectedValues.includes(val));

  return (
    <div className="relative inline-block text-left w-full" ref={dropdownRef}>
      {/* Dropdown button */}
      <div>
        <button
          id={id}
          name={id}
          type="button"
          className="inline-flex justify-between w-full rounded-md border border-gray-300 p-2.5 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          onClick={toggleDropdown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="truncate">{getDisplayText()}</span>
          <FaChevronDown
            className={`-mr-1 ml-2 h-4 w-4 transform ${
              isOpen ? "rotate-180" : ""
            } transition-transform duration-150`}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-full rounded-md bg-white focus:outline-none z-10 border border-gray-200">
          <ul
            className="py-1 overflow-y-auto max-h-60"
            role="listbox"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {options.map((option) => {
              // Determine checked state based on option type
              const isChecked =
                option.value === ""
                  ? areAllActualOptionsSelected // "All" checkbox reflects state of others
                  : selectedValues.includes(option.value); // Regular checkbox state

              return (
                <li
                  key={option.value}
                  className="text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center cursor-pointer"
                  role="option"
                  aria-selected={isChecked} // Use derived isChecked
                  onClick={() => handleOptionClick(option.value)}
                >
                  <label
                    htmlFor={`${baseId}-multi-${String(option.value || "all")}`}
                    className="flex items-center w-full px-4 py-2 cursor-pointer"
                  >
                    <input
                      id={`${baseId}-multi-${String(option.value || "all")}`}
                      name={`${baseId}-multi-${String(option.value || "all")}`}
                      type="checkbox"
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mr-3"
                      checked={isChecked} // Use derived isChecked
                      onChange={() => {}} // Keep onChange minimal as click on li handles logic
                    />
                    <span className="flex-1">{option.label}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
