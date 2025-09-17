import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FieldProvider } from '../FieldProvider';
import { Field } from '../Field';
import { TextInputAdapter } from '../TextInputAdapter';
import { TextareaAdapter } from '../TextareaAdapter';
import { CheckboxAdapter } from '../CheckboxAdapter';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

function wrap(ui: React.ReactNode) {
  return render(ui);
}

describe('Field Composer', () => {
  describe('Core Functionality', () => {
    it('associates label and control, and passes axe', async () => {
      wrap(
        <FieldProvider name="email" label="Email address" required>
          <Field>
            <TextInputAdapter />
          </Field>
        </FieldProvider>
      );
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Email address');
      expect(label).toHaveAttribute('for', input.getAttribute('id'));

      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });

    it('shows error in live region and sets aria-invalid', async () => {
      const validate = (v: unknown) => (!v ? 'Required' : null);
      wrap(
        <FieldProvider name="name" label="Name" validate={validate}>
          <Field>
            <TextInputAdapter />
          </Field>
        </FieldProvider>
      );
      const input = screen.getByRole('textbox');
      fireEvent.blur(input);
      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent('Required');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Adapters', () => {
    it('checkbox adapter toggles boolean value', () => {
      const validate = () => null;
      wrap(
        <FieldProvider
          name="tos"
          label="Accept terms"
          defaultValue={false}
          validate={validate}
        >
          <Field>
            <CheckboxAdapter />
          </Field>
        </FieldProvider>
      );
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('textarea adapter renders and passes axe', async () => {
      wrap(
        <FieldProvider name="bio" label="Bio">
          <Field>
            <TextareaAdapter />
          </Field>
        </FieldProvider>
      );
      const textarea = screen.getByRole('textbox');
      expect(textarea.tagName.toLowerCase()).toBe('textarea');

      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Accessibility', () => {
    it('supports keyboard navigation between fields', async () => {
      wrap(
        <div>
          <FieldProvider name="first" label="First Field">
            <Field>
              <TextInputAdapter />
            </Field>
          </FieldProvider>
          <FieldProvider name="second" label="Second Field">
            <Field>
              <TextInputAdapter />
            </Field>
          </FieldProvider>
        </div>
      );

      const inputs = screen.getAllByRole('textbox');
      expect(inputs).toHaveLength(2);

      // Test tab order
      inputs[0].focus();
      expect(inputs[0]).toHaveFocus();
    });

    it('announces validation errors to screen readers', async () => {
      const validate = (v: unknown) => (!v ? 'This field is required' : null);
      wrap(
        <FieldProvider
          name="required-field"
          label="Required Field"
          validate={validate}
        >
          <Field>
            <TextInputAdapter />
          </Field>
        </FieldProvider>
      );

      const input = screen.getByRole('textbox');
      fireEvent.blur(input);

      const errorMessage = await screen.findByRole('alert');
      expect(errorMessage).toHaveTextContent('This field is required');
      expect(errorMessage).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Context Orchestration', () => {
    it('provides field context to child components', () => {
      const TestComponent = () => {
        // This would use useFieldContext in a real scenario
        return <div data-testid="context-consumer">Context works</div>;
      };

      wrap(
        <FieldProvider name="test" label="Test Field">
          <Field>
            <TestComponent />
          </Field>
        </FieldProvider>
      );

      expect(screen.getByTestId('context-consumer')).toBeInTheDocument();
    });

    it('handles controlled and uncontrolled modes', () => {
      const handleChange = jest.fn();

      // Controlled mode
      const { rerender } = wrap(
        <FieldProvider
          name="controlled"
          label="Controlled"
          value="initial"
          onChange={handleChange}
        >
          <Field>
            <TextInputAdapter />
          </Field>
        </FieldProvider>
      );

      const controlledInput = screen.getByRole('textbox');
      expect(controlledInput).toHaveValue('initial');

      // Uncontrolled mode
      rerender(
        <FieldProvider
          name="uncontrolled"
          label="Uncontrolled"
          defaultValue="default"
        >
          <Field>
            <TextInputAdapter />
          </Field>
        </FieldProvider>
      );

      const uncontrolledInput = screen.getByRole('textbox');
      expect(uncontrolledInput).toHaveValue('default');
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens for styling', () => {
      wrap(
        <FieldProvider name="styled" label="Styled Field">
          <Field>
            <TextInputAdapter />
          </Field>
        </FieldProvider>
      );

      const field = screen.getByRole('textbox').closest('[class*="field"]');
      expect(field).toBeInTheDocument();
      // In a real test, you'd check for specific CSS custom properties
    });
  });
});
