import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { RadioGroup } from '@/components/FormFields/RadioGroup';
import { FormValues } from '@/lib/formSchema';

const mockOptions = [
  { value: 'daikin', label: 'Daikin' },
  { value: 'carrier', label: 'Carrier' },
  { value: 'other', label: 'อื่นๆ' },
] as const;

// Wrapper component to provide form context
const RadioGroupWrapper = ({
  name = 'ac_brand' as keyof FormValues,
  error = undefined,
  options = mockOptions,
  hasOtherOption = false,
  otherFieldName = undefined as keyof FormValues | undefined,
  otherValue = '',
  className = '',
  defaultValue = '',
}) => {
  const { register } = useForm<FormValues>({
    defaultValues: {
      [name]: defaultValue,
    },
  });

  return (
    <RadioGroup
      name={name}
      register={register}
      error={error}
      options={options}
      hasOtherOption={hasOtherOption}
      otherFieldName={otherFieldName}
      otherValue={otherValue}
      className={className}
    />
  );
};

describe('RadioGroup component', () => {
  describe('Rendering', () => {
    test('should render all radio options', () => {
      render(<RadioGroupWrapper />);

      mockOptions.forEach(option => {
        const radio = screen.getByLabelText(option.label);
        expect(radio).toBeInTheDocument();
      });
    });

    test('should render radio buttons with correct type', () => {
      render(<RadioGroupWrapper />);

      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(mockOptions.length);

      radios.forEach(radio => {
        expect(radio).toHaveAttribute('type', 'radio');
      });
    });

    test('should generate unique IDs for each radio option', () => {
      render(<RadioGroupWrapper name="ac_brand" />);

      expect(screen.getByLabelText('Daikin')).toHaveAttribute('id', 'ac_brand-daikin');
      expect(screen.getByLabelText('Carrier')).toHaveAttribute('id', 'ac_brand-carrier');
      expect(screen.getByLabelText('อื่นๆ')).toHaveAttribute('id', 'ac_brand-other');
    });

    test('should apply custom className to container', () => {
      const { container } = render(<RadioGroupWrapper className="custom-class" />);
      const flexContainer = container.querySelector('.flex');
      expect(flexContainer).toHaveClass('custom-class');
    });

    test('should render labels with correct text', () => {
      render(<RadioGroupWrapper />);

      expect(screen.getByText('Daikin')).toBeInTheDocument();
      expect(screen.getByText('Carrier')).toBeInTheDocument();
      expect(screen.getByText('อื่นๆ')).toBeInTheDocument();
    });
  });

  describe('Other option functionality', () => {
    test('should not show other text input when hasOtherOption is false', () => {
      render(<RadioGroupWrapper hasOtherOption={false} />);

      const textInputs = screen.queryAllByPlaceholderText('ระบุ...');
      expect(textInputs).toHaveLength(0);
    });

    test('should show other text input when hasOtherOption is true', () => {
      render(
        <RadioGroupWrapper
          hasOtherOption={true}
          otherFieldName="brand_other_text"
        />
      );

      const textInput = screen.getByPlaceholderText('ระบุ...');
      expect(textInput).toBeInTheDocument();
    });

    test('should render text input only for "other" option', () => {
      render(
        <RadioGroupWrapper
          hasOtherOption={true}
          otherFieldName="brand_other_text"
        />
      );

      // Should only have one text input (for "other" option)
      const textInputs = screen.getAllByPlaceholderText('ระบุ...');
      expect(textInputs).toHaveLength(1);
    });

    test('should allow typing in other text input', async () => {
      const user = userEvent.setup();
      render(
        <RadioGroupWrapper
          hasOtherOption={true}
          otherFieldName="brand_other_text"
        />
      );

      const textInput = screen.getByPlaceholderText('ระบุ...') as HTMLInputElement;
      await user.type(textInput, 'Mitsubishi');

      expect(textInput.value).toBe('Mitsubishi');
    });
  });

  describe('Error handling', () => {
    test('should not show error message when no error', () => {
      render(<RadioGroupWrapper />);

      const errorMessage = screen.queryByText(/กรุณา/);
      expect(errorMessage).not.toBeInTheDocument();
    });

    test('should display error message when error exists', () => {
      const errorMessage = 'กรุณาเลือกยี่ห้อเครื่องปรับอากาศ';
      const error = { type: 'required', message: errorMessage };

      render(<RadioGroupWrapper error={error as any} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    test('should show error message in red text', () => {
      const errorMessage = 'Required field';
      const error = { type: 'required', message: errorMessage };

      render(<RadioGroupWrapper error={error as any} />);

      const errorElement = screen.getByText(errorMessage);
      expect(errorElement).toHaveClass('text-red-600');
      expect(errorElement).toHaveClass('text-sm');
    });
  });

  describe('User interaction', () => {
    test('should allow selecting a radio option', async () => {
      const user = userEvent.setup();
      render(<RadioGroupWrapper />);

      const daikinRadio = screen.getByLabelText('Daikin') as HTMLInputElement;
      await user.click(daikinRadio);

      expect(daikinRadio.checked).toBe(true);
    });

    test('should deselect previous option when selecting new one', async () => {
      const user = userEvent.setup();
      render(<RadioGroupWrapper />);

      const daikinRadio = screen.getByLabelText('Daikin') as HTMLInputElement;
      const carrierRadio = screen.getByLabelText('Carrier') as HTMLInputElement;

      await user.click(daikinRadio);
      expect(daikinRadio.checked).toBe(true);

      await user.click(carrierRadio);
      expect(carrierRadio.checked).toBe(true);
      expect(daikinRadio.checked).toBe(false);
    });

    test('should allow clicking label to select radio', async () => {
      const user = userEvent.setup();
      render(<RadioGroupWrapper />);

      const daikinLabel = screen.getByText('Daikin');
      await user.click(daikinLabel);

      const daikinRadio = screen.getByLabelText('Daikin') as HTMLInputElement;
      expect(daikinRadio.checked).toBe(true);
    });
  });

  describe('Styling', () => {
    test('should have cursor-pointer class on labels', () => {
      render(<RadioGroupWrapper />);

      const label = screen.getByText('Daikin');
      expect(label).toHaveClass('cursor-pointer');
      expect(label).toHaveClass('select-none');
    });

    test('should have correct styling classes on radio buttons', () => {
      render(<RadioGroupWrapper />);

      const radio = screen.getByLabelText('Daikin');
      expect(radio).toHaveClass('w-5');
      expect(radio).toHaveClass('h-5');
      expect(radio).toHaveClass('cursor-pointer');
    });

    test('should have correct styling on other text input', () => {
      render(
        <RadioGroupWrapper
          hasOtherOption={true}
          otherFieldName="brand_other_text"
        />
      );

      const textInput = screen.getByPlaceholderText('ระบุ...');
      expect(textInput).toHaveClass('ml-2');
      expect(textInput).toHaveClass('px-2');
      expect(textInput).toHaveClass('py-1');
      expect(textInput).toHaveClass('border');
      expect(textInput).toHaveClass('rounded-md');
      expect(textInput).toHaveClass('w-48');
    });

    test('should have flex layout for options', () => {
      const { container } = render(<RadioGroupWrapper />);

      const flexContainer = container.querySelector('.flex');
      expect(flexContainer).toHaveClass('flex');
      expect(flexContainer).toHaveClass('gap-5');
      expect(flexContainer).toHaveClass('flex-wrap');
    });
  });

  describe('Accessibility', () => {
    test('should be accessible by role', () => {
      render(<RadioGroupWrapper />);

      const radios = screen.getAllByRole('radio');
      expect(radios.length).toBeGreaterThan(0);
    });

    test('should have proper label associations', () => {
      render(<RadioGroupWrapper />);

      mockOptions.forEach(option => {
        const radio = screen.getByLabelText(option.label);
        expect(radio).toBeInTheDocument();
      });
    });

    test('should have unique IDs for each radio button', () => {
      render(<RadioGroupWrapper name="ac_brand" />);

      const ids = mockOptions.map(option => `ac_brand-${option.value}`);
      ids.forEach(id => {
        const element = document.getElementById(id);
        expect(element).toBeInTheDocument();
      });
    });
  });

  describe('Form integration', () => {
    test('should register with correct name attribute', () => {
      render(<RadioGroupWrapper name="ac_brand" />);

      const radios = screen.getAllByRole('radio') as HTMLInputElement[];
      radios.forEach(radio => {
        expect(radio.name).toBe('ac_brand');
      });
    });

    test('should have correct values for each option', () => {
      render(<RadioGroupWrapper />);

      const daikinRadio = screen.getByLabelText('Daikin') as HTMLInputElement;
      const carrierRadio = screen.getByLabelText('Carrier') as HTMLInputElement;
      const otherRadio = screen.getByLabelText('อื่นๆ') as HTMLInputElement;

      expect(daikinRadio.value).toBe('daikin');
      expect(carrierRadio.value).toBe('carrier');
      expect(otherRadio.value).toBe('other');
    });
  });
});
