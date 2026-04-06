'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({ label, error, helperText, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full px-4 py-2.5 border rounded-lg text-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500',
          error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
}

export function Textarea({
  label,
  error,
  className,
  id,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          'w-full px-4 py-2.5 border rounded-lg text-sm transition-colors resize-y min-h-[100px]',
          'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500',
          error ? 'border-red-300' : 'border-gray-300',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
