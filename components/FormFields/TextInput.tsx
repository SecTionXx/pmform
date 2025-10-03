import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';
import { FormValues } from '@/lib/formSchema';

interface TextInputProps {
  name: keyof FormValues;
  register: UseFormRegister<FormValues>;
  error?: FieldError;
  placeholder?: string;
  type?: 'text' | 'date' | 'time';
  maxLength?: number;
  className?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  name,
  register,
  error,
  placeholder,
  type = 'text',
  maxLength,
  className = '',
}) => {
  return (
    <div className="w-full">
      <input
        type={type}
        {...register(name)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};
