'use client';

import { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
}

export default function InputField({ label, icon, className, ...props }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[#6B7280] font-poppins">{label}</label>
      )}
      <div className="flex items-center gap-2.5 px-4 py-3.5 bg-[#F9FAFB] rounded-2xl border-[1.5px] border-[#E5E7EB] focus-within:border-[#1A3448] transition-colors">
        {icon && <span className="text-gray-400 text-lg">{icon}</span>}
        <input
          className="flex-1 border-none bg-transparent outline-none text-[15px] font-poppins text-[#1A3448] placeholder:text-gray-400"
          {...props}
        />
      </div>
    </div>
  );
}
