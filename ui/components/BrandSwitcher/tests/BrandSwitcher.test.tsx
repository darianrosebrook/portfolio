import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrandProvider } from '@/context/BrandContext';
import { BrandSwitcher } from '../BrandSwitcher';

function renderWithBrand(ui: React.ReactElement) {
  return render(<BrandProvider>{ui}</BrandProvider>);
}

describe('BrandSwitcher', () => {
  it('renders without throwing inside BrandProvider', () => {
    const { container } = renderWithBrand(<BrandSwitcher />);
    expect(container.firstChild).toBeTruthy();
  });

  it.todo('contract: renders brand swatches for each available brand');
  it.todo('contract: auto-cycle interval respects MIN_AUTO_CYCLE_INTERVAL_MS floor');
  it.todo('contract: keyboard navigation cycles brands when enableKeyboard=true');
});
