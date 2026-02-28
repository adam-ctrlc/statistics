"use client";

import { useState, useEffect, useRef } from "react";
import { FaChevronDown } from "react-icons/fa";

export default function CustomSelect({
  id,
  value,
  defaultValue = "",
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
  name,
  ariaInvalid,
  ariaDescribedby,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  const isControlled = value !== undefined;

  useEffect(() => {
    if (!isControlled && selectRef.current && defaultValue !== undefined) {
      selectRef.current.value = defaultValue?.toString() || "";
    }
  }, [isControlled, defaultValue]);

  const safeValue = value?.toString() || "";

  return (
    <div className="relative">
      <select
        ref={selectRef}
        id={id}
        name={name}
        className={`appearance-none w-full p-2.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white pr-8 h-11 ${className} ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        {...(isControlled
          ? { value: safeValue }
          : { defaultValue: defaultValue?.toString() || "" })}
        onChange={onChange}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedby}
        disabled={disabled}
      >
        {!isControlled && placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option, idx) => (
          <option
            key={`${option.value}-${idx}`}
            value={option.value?.toString() || ""}
          >
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <FaChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>
    </div>
  );
}
