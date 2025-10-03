import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Suppress console.error for these tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary component', () => {
  describe('Normal rendering', () => {
    test('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    test('should not show error UI when children render successfully', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(screen.queryByText('เกิดข้อผิดพลาด')).not.toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    test('should catch error and display fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('เกิดข้อผิดพลาด')).toBeInTheDocument();
      expect(screen.getByText(/ส่วนนี้ของแอปพลิเคชันเกิดปัญหา/)).toBeInTheDocument();
    });

    test('should display error message in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Test error')).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    test('should show reset button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const resetButton = screen.getByText('ลองใหม่อีกครั้ง');
      expect(resetButton).toBeInTheDocument();
      expect(resetButton.tagName).toBe('BUTTON');
    });

    test('should call onError callback when error occurs', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });
  });

  describe('Custom fallback', () => {
    test('should render custom fallback when provided', () => {
      const customFallback = <div>Custom error message</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(screen.queryByText('เกิดข้อผิดพลาด')).not.toBeInTheDocument();
    });
  });

  describe('Reset functionality', () => {
    test('should reset error state when reset button is clicked', async () => {
      const user = userEvent.setup();
      let shouldThrow = true;

      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );

      // Error UI should be visible
      expect(screen.getByText('เกิดข้อผิดพลาด')).toBeInTheDocument();

      // Update component to not throw error
      shouldThrow = false;
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );

      // Click reset button
      const resetButton = screen.getByText('ลองใหม่อีกครั้ง');
      await user.click(resetButton);

      // Should show normal content again
      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(screen.queryByText('เกิดข้อผิดพลาด')).not.toBeInTheDocument();
    });
  });

  describe('Error boundary wrapper', () => {
    test('should isolate errors to specific boundary', () => {
      render(
        <div>
          <ErrorBoundary>
            <div>Safe content 1</div>
          </ErrorBoundary>

          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>

          <ErrorBoundary>
            <div>Safe content 2</div>
          </ErrorBoundary>
        </div>
      );

      // First and third boundaries should show normal content
      expect(screen.getByText('Safe content 1')).toBeInTheDocument();
      expect(screen.getByText('Safe content 2')).toBeInTheDocument();

      // Second boundary should show error UI
      expect(screen.getByText('เกิดข้อผิดพลาด')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have accessible error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const heading = screen.getByRole('heading', { name: /เกิดข้อผิดพลาด/i });
      expect(heading).toBeInTheDocument();
    });

    test('should have accessible reset button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const button = screen.getByRole('button', { name: /ลองใหม่อีกครั้ง/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Visual elements', () => {
    test('should display warning icon', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    test('should have proper styling classes', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const errorContainer = container.querySelector('.bg-white.border-2');
      expect(errorContainer).toBeInTheDocument();
    });
  });
});
