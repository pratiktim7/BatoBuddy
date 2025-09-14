import React, { memo } from 'react';

interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: React.ReactNode;
}

const InputField = memo(({ value, onChange, placeholder, icon }: InputFieldProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <div className="absolute left-4 top-4 w-5 h-5">
        {icon}
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="w-full pl-14 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField;
