'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'danger';
  fullWidth?: boolean;
}

export default function Button({ children, variant = 'primary', fullWidth = true, className, disabled, ...props }: ButtonProps) {
  const base = 'px-6 py-4 rounded-2xl text-base font-semibold font-poppins cursor-pointer transition-all duration-100 border-none';

  const variants = {
    primary: disabled
      ? 'bg-gray-400 text-white cursor-default'
      : 'bg-[#1A3448] text-white hover:opacity-90 active:scale-95',
    ghost: 'bg-transparent text-[#1A3448] border-[1.5px] border-[#1A3448] hover:bg-[#1A3448]/5 active:scale-95',
    danger: 'bg-transparent text-red-500 border-[1.5px] border-red-400 hover:bg-red-50 active:scale-95',
  };

  return (
    <button
      disabled={disabled}
      className={cn(base, variants[variant], fullWidth && 'w-full', className)}
      {...props}
    >
      {children}
    </button>
  );
}
