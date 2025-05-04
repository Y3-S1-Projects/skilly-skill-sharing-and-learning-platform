import React, { useState, useRef, useEffect } from "react";

const FloatingLabelInput = ({
  id,
  name,
  type = "text",
  autoComplete,
  value,
  onChange,
  error,
  label,
  className = "",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const shouldFloat = isFocused || value;

  return (
    <div className={`relative ${className}`} ref={inputRef}>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        className={`peer block w-full px-4 py-3 bg-gray-800 border ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-700 focus:ring-2 focus:ring-blue-500"
        } rounded-lg text-white focus:outline-none focus:border-transparent sm:text-sm placeholder-transparent
  /* Fix for autofill background */
  autofill:bg-gray-800 ![color-scheme:dark]
  /* Chrome/Safari */
  [-webkit-text-fill-color:white]
  /* Firefox */
  [&:-webkit-autofill]:bg-gray-800
  [&:-webkit-autofill]:text-white
  [&:-webkit-autofill:focus]:bg-gray-800
  `}
        // placeholder={label}
      />
      <label
        htmlFor={id}
        className={`absolute left-4 transform transition-all duration-200 ease-out origin-left pointer-events-none ${
          shouldFloat
            ? "-translate-y-3 scale-75 text-blue-400 bg-gray-800 px-1"
            : "translate-y-0 scale-100 text-gray-400"
        } ${shouldFloat ? "top-0" : "top-3"}`}
      >
        {label}
      </label>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FloatingLabelInput;
