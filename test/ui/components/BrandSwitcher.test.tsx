import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrandProvider } from '@/context/BrandContext';
import { BrandSwitcher } from '@/ui/components/BrandSwitcher';

function mockEmptyStorage() {
  const ls = window.localStorage as unknown as {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
  };
  ls.getItem.mockReset();
  ls.setItem.mockReset();
  ls.removeItem.mockReset();
  ls.getItem.mockReturnValue(null);
}

beforeEach(() => {
  mockEmptyStorage();
  document.documentElement.removeAttribute('data-brand');
  document.documentElement.removeAttribute('data-density');
  // Reset focus to body before each keyboard test.
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
});

describe('BrandSwitcher render', () => {
  it('renders one swatch per brand with aria-pressed reflecting selection', async () => {
    render(
      <BrandProvider>
        <BrandSwitcher />
      </BrandProvider>
    );

    const swatches = await screen.findAllByRole('button', {
      name: /^Switch to .+ theme$/,
    });
    // 10 brands defined in BrandContext (default..slate)
    expect(swatches).toHaveLength(10);

    const defaultSwatch = screen.getByRole('button', {
      name: 'Switch to Default theme',
    });
    expect(defaultSwatch).toHaveAttribute('aria-pressed', 'true');

    const corporateSwatch = screen.getByRole('button', {
      name: 'Switch to Corporate theme',
    });
    expect(corporateSwatch).toHaveAttribute('aria-pressed', 'false');
  });

  it('clicking a swatch updates active brand and DOM data attributes (applyBrand atomicity through the UI)', async () => {
    const user = userEvent.setup();
    render(
      <BrandProvider>
        <BrandSwitcher />
      </BrandProvider>
    );

    const forestSwatch = await screen.findByRole('button', {
      name: 'Switch to Forest theme',
    });
    await user.click(forestSwatch);

    // Forest brand defines density='spacious'.
    expect(document.documentElement.getAttribute('data-brand')).toBe('forest');
    expect(document.documentElement.getAttribute('data-density')).toBe(
      'spacious'
    );
    expect(forestSwatch).toHaveAttribute('aria-pressed', 'true');
  });

  it('compact mode renders swatches without the section cards', async () => {
    render(
      <BrandProvider>
        <BrandSwitcher compact />
      </BrandProvider>
    );

    await screen.findAllByRole('button', { name: /^Switch to .+ theme$/ });
    // The "Brand Theme" heading only renders in non-compact mode.
    expect(screen.queryByText('Brand Theme')).not.toBeInTheDocument();
  });
});

describe('BrandSwitcher keyboard scope (D5)', () => {
  it('does NOT cycle when arrow keys fire while focus is on document body', async () => {
    render(
      <BrandProvider>
        <BrandSwitcher />
      </BrandProvider>
    );

    await screen.findByRole('button', { name: 'Switch to Default theme' });
    expect(document.documentElement.getAttribute('data-brand')).toBe('default');

    // Body has focus by default in jsdom.
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    fireEvent.keyDown(window, { key: 'r' });

    // No brand change because focus was outside the switcher.
    expect(document.documentElement.getAttribute('data-brand')).toBe('default');
  });

  it('cycles when arrow keys fire while focus is inside the switcher', async () => {
    render(
      <BrandProvider>
        <BrandSwitcher />
      </BrandProvider>
    );

    const defaultSwatch = await screen.findByRole('button', {
      name: 'Switch to Default theme',
    });
    // Move focus inside the switcher (any swatch button works).
    defaultSwatch.focus();
    expect(document.activeElement).toBe(defaultSwatch);

    fireEvent.keyDown(window, { key: 'ArrowRight' });

    // Default → Corporate is the first cycle step (BRANDS[0] → BRANDS[1]).
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-brand')).toBe(
        'corporate'
      );
    });
  });

  it('does not bind any listener when enableKeyboard=false', async () => {
    render(
      <BrandProvider>
        <BrandSwitcher enableKeyboard={false} />
      </BrandProvider>
    );

    const defaultSwatch = await screen.findByRole('button', {
      name: 'Switch to Default theme',
    });
    defaultSwatch.focus();

    fireEvent.keyDown(window, { key: 'ArrowRight' });

    expect(document.documentElement.getAttribute('data-brand')).toBe('default');
  });
});

describe('BrandSwitcher auto-cycle interval input (D12)', () => {
  it('lets the user type a multi-digit value and commits ≥1000 on blur', async () => {
    const user = userEvent.setup();
    render(
      <BrandProvider>
        <BrandSwitcher showAutoCycle />
      </BrandProvider>
    );

    // Enable auto-cycle so the interval input renders.
    const toggle = await screen.findByRole('checkbox', {
      name: /Auto-cycle brands/i,
    });
    await user.click(toggle);

    const intervalInput = (await screen.findByLabelText(
      /Interval:/
    )) as HTMLInputElement;

    // Default hydrated value is 5000ms.
    expect(intervalInput.value).toBe('5000');

    // Type a complete new value: clear, type 8000, blur.
    await user.clear(intervalInput);
    await user.type(intervalInput, '8000');
    expect(intervalInput.value).toBe('8000'); // draft visible while typing
    fireEvent.blur(intervalInput);

    await waitFor(() => {
      expect(intervalInput.value).toBe('8000');
    });
  });

  it('clamps a sub-1000 value up to 1000 on blur (commit-time validation)', async () => {
    const user = userEvent.setup();
    render(
      <BrandProvider>
        <BrandSwitcher showAutoCycle />
      </BrandProvider>
    );

    const toggle = await screen.findByRole('checkbox', {
      name: /Auto-cycle brands/i,
    });
    await user.click(toggle);

    const intervalInput = (await screen.findByLabelText(
      /Interval:/
    )) as HTMLInputElement;

    await user.clear(intervalInput);
    await user.type(intervalInput, '50');
    expect(intervalInput.value).toBe('50'); // draft accepted while typing
    fireEvent.blur(intervalInput);

    await waitFor(() => {
      expect(intervalInput.value).toBe('1000'); // clamped on commit
    });
  });

  it('reverts to the prior committed value when blurring on a non-numeric draft', async () => {
    const user = userEvent.setup();
    render(
      <BrandProvider>
        <BrandSwitcher showAutoCycle />
      </BrandProvider>
    );

    const toggle = await screen.findByRole('checkbox', {
      name: /Auto-cycle brands/i,
    });
    await user.click(toggle);

    const intervalInput = (await screen.findByLabelText(
      /Interval:/
    )) as HTMLInputElement;

    await user.clear(intervalInput);
    // jsdom's number input allows the empty-string draft. Blur should restore.
    fireEvent.blur(intervalInput);

    await waitFor(() => {
      expect(intervalInput.value).toBe('5000');
    });
  });
});
