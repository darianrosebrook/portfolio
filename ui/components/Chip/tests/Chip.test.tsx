import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Chip } from '../Chip';

describe('Chip', () => {
  it('renders children without throwing', () => {
    render(<Chip>Label</Chip>);
    expect(screen.getByRole('button', { name: 'Label' })).toBeInTheDocument();
  });

  it.todo('contract: renders as anchor when href prop is provided');
  it.todo('contract: asChild composes slot with provided child element');
  it.todo('contract: disabled state prevents interaction');
});
