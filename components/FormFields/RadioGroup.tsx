import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';
import { FormValues } from '@/lib/formSchema';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  name: keyof FormValues;
  register: UseFormRegister<FormValues>;
  error?: FieldError;
  options: readonly RadioOption[];
  hasOtherOption?: boolean;
  otherFieldName?: keyof FormValues;
  otherValue?: string;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  register,
  error,
  options,
  hasOtherOption = false,
  otherFieldName,
  otherValue,
  className = '',
}) => {
  return (
    <div className="w-full">
      <div className={`flex gap-5 flex-wrap ${className}`}>
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <input
              type="radio"
              id={`${name}-${option.value}`}
              value={option.value}
              {...register(name)}
              className="w-5 h-5 text-primary focus:ring-primary cursor-pointer"
            />
            <label
              htmlFor={`${name}-${option.value}`}
              className="cursor-pointer select-none"
            >
              {option.label}
            </label>
            {hasOtherOption && option.value === 'other' && otherFieldName && (
              <input
                type="text"
                {...register(otherFieldName)}
                placeholder="ระบุ..."
                className="ml-2 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary w-48"
              />
            )}
          </div>
        ))}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};
