import { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn('bg-white rounded-[20px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]', className)}
      {...props}
    >
      {children}
    </div>
  );
}
