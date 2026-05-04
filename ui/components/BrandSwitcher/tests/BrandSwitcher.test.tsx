import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '../../../../test/test-utils';
import { BrandSwitcher } from '../BrandSwitcher';

const setBrand = vi.fn();

vi.mock('@/context/BrandContext', () => ({
  useBrand: () => ({
    brand: 'default',
    availableBrands: [
      {
        id: 'default',
        name: 'Default',
        description: 'Default brand',
        accentColor: '#d9292b',
      },
      {
        id: 'ocean',
        name: 'Ocean',
        description: 'Ocean brand',
        accentColor: '#14b8a6',
      },
    ],
    setBrand,
    cycleBrand: vi.fn(),
    randomizeBrand: vi.fn(),
    isAutoCycling: false,
    setAutoCycling: vi.fn(),
    autoCycleInterval: 5000,
    setAutoCycleInterval: vi.fn(),
    density: 'default',
    setDensity: vi.fn(),
    headingFont: 'inter',
    setHeadingFont: vi.fn(),
    bodyFont: 'inter',
    setBodyFont: vi.fn(),
  }),
}));

describe('BrandSwitcher', () => {
  it('renders compact swatches with accessible labels', () => {
    render(<BrandSwitcher compact enableKeyboard={false} />);

    expect(
      screen.getByRole('button', { name: 'Switch to Default theme' })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: 'Switch to Ocean theme' })
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls setBrand when a swatch is selected', () => {
    render(<BrandSwitcher compact enableKeyboard={false} />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Switch to Ocean theme' })
    );

    expect(setBrand).toHaveBeenCalledWith('ocean');
  });
});
