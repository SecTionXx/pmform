import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { TextInput } from '@/components/FormFields/TextInput';
import { FormValues } from '@/lib/formSchema';

// Wrapper component to provide form context
const TextInputWrapper = ({
  name = 'location' as keyof FormValues,
  error = undefined,
  placeholder = '',
  type = 'text' as 'text' | 'date' | 'time',
  maxLength = undefined,
  className = '',
  defaultValue = '',
}) => {
  const { register } = useForm<FormValues>({
    defaultValues: {
      [name]: defaultValue,
    },
  });

  return (
    <TextInput
      name={name}
      register={register}
      error={error}
      placeholder={placeholder}
      type={type}
      maxLength={maxLength}
      className={className}
    />
  );
};

describe('TextInput component', () => {
  describe('Rendering', () => {
    test('should render input field', () => {
      render(<TextInputWrapper />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    test('should render with placeholder', () => {
      const placeholder = 'Enter location';
      render(<TextInputWrapper placeholder={placeholder} />);
      const input = screen.getByPlaceholderText(placeholder);
      expect(input).toBeInTheDocument();
    });

    test('should render with default value', () => {
      const defaultValue = 'Test Location';
      render(<TextInputWrapper defaultValue={defaultValue} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe(defaultValue);
    });

    test('should apply custom className', () => {
      const customClass = 'custom-test-class';
      render(<TextInputWrapper className={customClass} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass(customClass);
    });

    test('should render as text input by default', () => {
      render(<TextInputWrapper />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });

    test('should render as date input when type is date', () => {
      render(<TextInputWrapper type="date" />);
      const input = document.querySelector('input[type="date"]');
      expect(input).toBeInTheDocument();
    });

    test('should render as time input when type is time', () => {
      render(<TextInputWrapper type="time" />);
      const input = document.querySelector('input[type="time"]');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    test('should not show error message when no error', () => {
      render(<TextInputWrapper />);
      const errorMessage = screen.queryByText(/error/i);
      expect(errorMessage).not.toBeInTheDocument();
    });

    test('should display error message when error exists', () => {
      const errorMessage = 'This field is required';
      const error = { type: 'required', message: errorMessage };
      render(<TextInputWrapper error={error as any} />);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    test('should apply error border class when error exists', () => {
      const error = { type: 'required', message: 'Required' };
      render(<TextInputWrapper error={error as any} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500');
    });

    test('should apply normal border class when no error', () => {
      render(<TextInputWrapper />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-gray-300');
    });

    test('should show error message in red text', () => {
      const errorMessage = 'Invalid input';
      const error = { type: 'pattern', message: errorMessage };
      render(<TextInputWrapper error={error as any} />);
      const errorElement = screen.getByText(errorMessage);
      expect(errorElement).toHaveClass('text-red-600');
    });
  });

  describe('User interaction', () => {
    test('should allow user to type text', async () => {
      const user = userEvent.setup();
      render(<TextInputWrapper />);
      const input = screen.getByRole('textbox') as HTMLInputElement;

      await user.type(input, 'Hello World');
      expect(input.value).toBe('Hello World');
    });

    test('should allow user to clear text', async () => {
      const user = userEvent.setup();
      render(<TextInputWrapper defaultValue="Initial text" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;

      await user.clear(input);
      expect(input.value).toBe('');
    });

    test('should respect maxLength attribute', () => {
      const maxLength = 10;
      render(<TextInputWrapper maxLength={maxLength} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', maxLength.toString());
    });

    test('should focus on input when clicked', async () => {
      const user = userEvent.setup();
      render(<TextInputWrapper />);
      const input = screen.getByRole('textbox');

      await user.click(input);
      expect(input).toHaveFocus();
    });
  });

  describe('Styling', () => {
    test('should have base styling classes', () => {
      render(<TextInputWrapper />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('w-full');
      expect(input).toHaveClass('px-3');
      expect(input).toHaveClass('py-2');
      expect(input).toHaveClass('border');
      expect(input).toHaveClass('rounded-md');
    });

    test('should have focus styling classes', () => {
      render(<TextInputWrapper />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus:outline-none');
      expect(input).toHaveClass('focus:ring-2');
      expect(input).toHaveClass('focus:ring-primary');
    });
  });

  describe('Accessibility', () => {
    test('should be accessible by role', () => {
      render(<TextInputWrapper />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    test('should have correct input type for screen readers', () => {
      render(<TextInputWrapper type="date" />);
      const input = document.querySelector('input[type="date"]');
      expect(input).toBeInTheDocument();
    });
  });
});
