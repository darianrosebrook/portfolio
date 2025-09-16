import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { FieldProvider } from '@/ui/components/Field';
import { Field } from '@/ui/components/Field';
import { TextInputAdapter } from '@/ui/components/Field/TextInputAdapter';
import { TextareaAdapter } from '@/ui/components/Field/TextareaAdapter';
import { CheckboxAdapter } from '@/ui/components/Field/CheckboxAdapter';

function wrap(ui: React.ReactNode) {
  return render(ui);
}

describe('Field composer', () => {
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
