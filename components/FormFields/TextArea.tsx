import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';
import { FormValues } from '@/lib/formSchema';

interface TextAreaProps {
  name: keyof FormValues;
  register: UseFormRegister<FormValues>;
  error?: FieldError;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  name,
  register,
  error,
  placeholder,
  rows = 3,
  className = '',
}) => {
  return (
    <div className="w-full">
      <textarea
        {...register(name)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-3 py-2 border rounded-md resize-vertical focus:outline-none focus:ring-2 focus:ring-primary ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};
