import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { PostOperationSection } from '@/components/FormSections/PostOperationSection';
import { FormValues } from '@/lib/formSchema';
import { WORK_PROCEDURES } from '@/utils/constants';

// Wrapper component to provide form context
const PostOperationSectionWrapper = ({
  defaultValues = {},
}: {
  defaultValues?: Partial<FormValues>;
}) => {
  const { register, control, formState } = useForm<FormValues>({
    defaultValues: {
      refrigerant_pressure: '',
      refrigerant_added: '',
      repair_work_detail: '',
      suggestions: '',
      next_month: '',
      next_year: '',
      work_procedures: {
        step1: false,
        step2: false,
        step3: false,
        step4: false,
        step5: false,
        step6: false,
      },
      ...defaultValues,
    },
  });

  return (
    <PostOperationSection
      register={register}
      control={control}
      errors={formState.errors}
    />
  );
};

describe('PostOperationSection component', () => {
  describe('Work Procedures Checkboxes', () => {
    test('should render all 6 work procedure checkboxes', () => {
      render(<PostOperationSectionWrapper />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThanOrEqual(6);
    });

    test('should render all work procedure labels', () => {
      render(<PostOperationSectionWrapper />);

      WORK_PROCEDURES.forEach((procedure) => {
        expect(screen.getByText(procedure)).toBeInTheDocument();
      });
    });

    test('should have all checkboxes unchecked by default', () => {
      render(<PostOperationSectionWrapper />);

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach((checkbox) => {
        expect(checkbox).not.toBeChecked();
      });
    });

    test('should allow checking individual checkboxes', async () => {
      const user = userEvent.setup();
      render(<PostOperationSectionWrapper />);

      const checkboxes = screen.getAllByRole('checkbox');
      const firstCheckbox = checkboxes[0] as HTMLInputElement;

      expect(firstCheckbox).not.toBeChecked();

      await user.click(firstCheckbox);
      expect(firstCheckbox).toBeChecked();
    });

    test('should allow unchecking checkboxes', async () => {
      const user = userEvent.setup();
      render(<PostOperationSectionWrapper />);

      const checkboxes = screen.getAllByRole('checkbox');
      const firstCheckbox = checkboxes[0] as HTMLInputElement;

      // Check it first
      await user.click(firstCheckbox);
      expect(firstCheckbox).toBeChecked();

      // Then uncheck it
      await user.click(firstCheckbox);
      expect(firstCheckbox).not.toBeChecked();
    });

    test('should allow checking multiple checkboxes independently', async () => {
      const user = userEvent.setup();
      render(<PostOperationSectionWrapper />);

      const checkboxes = screen.getAllByRole('checkbox');
      const firstCheckbox = checkboxes[0] as HTMLInputElement;
      const thirdCheckbox = checkboxes[2] as HTMLInputElement;

      await user.click(firstCheckbox);
      await user.click(thirdCheckbox);

      expect(firstCheckbox).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
      expect(thirdCheckbox).toBeChecked();
    });

    test('should load with pre-checked values', () => {
      render(
        <PostOperationSectionWrapper
          defaultValues={{
            work_procedures: {
              step1: true,
              step2: false,
              step3: true,
              step4: false,
              step5: false,
              step6: true,
            },
          }}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
      expect(checkboxes[2]).toBeChecked();
      expect(checkboxes[3]).not.toBeChecked();
      expect(checkboxes[4]).not.toBeChecked();
      expect(checkboxes[5]).toBeChecked();
    });
  });

  describe('Refrigerant Fields', () => {
    test('should render refrigerant pressure input', () => {
      render(<PostOperationSectionWrapper />);
      expect(screen.getByPlaceholderText('กรอกแรงดัน')).toBeInTheDocument();
    });

    test('should render refrigerant added input', () => {
      render(<PostOperationSectionWrapper />);
      expect(screen.getByPlaceholderText('กรอกปริมาณที่เติม')).toBeInTheDocument();
    });

    test('should allow typing in refrigerant fields', async () => {
      const user = userEvent.setup();
      render(<PostOperationSectionWrapper />);

      const pressureInput = screen.getByPlaceholderText('กรอกแรงดัน') as HTMLInputElement;
      const addedInput = screen.getByPlaceholderText('กรอกปริมาณที่เติม') as HTMLInputElement;

      await user.type(pressureInput, '65');
      await user.type(addedInput, '0.5');

      expect(pressureInput.value).toBe('65');
      expect(addedInput.value).toBe('0.5');
    });
  });

  describe('Next Maintenance Fields', () => {
    test('should render next month and year inputs', () => {
      render(<PostOperationSectionWrapper />);

      expect(screen.getByPlaceholderText('กรอกเดือน')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('กรอกปี (พ.ศ.)')).toBeInTheDocument();
    });

    test('should allow typing in next maintenance fields', async () => {
      const user = userEvent.setup();
      render(<PostOperationSectionWrapper />);

      const monthInput = screen.getByPlaceholderText('กรอกเดือน') as HTMLInputElement;
      const yearInput = screen.getByPlaceholderText('กรอกปี (พ.ศ.)') as HTMLInputElement;

      await user.type(monthInput, '7');
      await user.type(yearInput, '2568');

      expect(monthInput.value).toBe('7');
      expect(yearInput.value).toBe('2568');
    });
  });

  describe('Optional Text Areas', () => {
    test('should render repair work detail textarea', () => {
      render(<PostOperationSectionWrapper />);
      expect(screen.getByPlaceholderText('ระบุรายละเอียด (ถ้ามี)...')).toBeInTheDocument();
    });

    test('should render suggestions textarea', () => {
      render(<PostOperationSectionWrapper />);
      expect(screen.getByPlaceholderText('ระบุข้อเสนอแนะ (ถ้ามี)...')).toBeInTheDocument();
    });

    test('should allow typing in text areas', async () => {
      const user = userEvent.setup();
      render(<PostOperationSectionWrapper />);

      const repairTextarea = screen.getByPlaceholderText('ระบุรายละเอียด (ถ้ามี)...') as HTMLTextAreaElement;
      await user.type(repairTextarea, 'เปลี่ยนฟิลเตอร์ใหม่');

      expect(repairTextarea.value).toBe('เปลี่ยนฟิลเตอร์ใหม่');
    });
  });

  describe('Section Header', () => {
    test('should render section header', () => {
      render(<PostOperationSectionWrapper />);
      expect(screen.getByText('บันทึกข้อมูล หลังดำเนินการ')).toBeInTheDocument();
    });

    test('should render work procedures header', () => {
      render(<PostOperationSectionWrapper />);
      expect(screen.getByText('# รายละเอียดการทำงาน')).toBeInTheDocument();
    });
  });

  describe('Temperature Setting Info', () => {
    test('should render temperature setting information', () => {
      render(<PostOperationSectionWrapper />);
      expect(screen.getByText(/ตั้งอุณหภูมิไว้ที่ 25 องศา/)).toBeInTheDocument();
    });
  });
});
