import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Divider } from '@/ui/components/Divider';
import { VisuallyHidden } from '@/ui/components/VisuallyHidden';

expect.extend(toHaveNoViolations);

describe('Divider', () => {
  it('renders with default horizontal orientation', () => {
    render(<Divider data-testid="divider" />);
    const divider = screen.getByTestId('divider');
    expect(divider).toBeInTheDocument();
    expect(divider).toHaveAttribute('role', 'separator');
    expect(divider).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('renders with vertical orientation', () => {
    render(<Divider orientation="vertical" data-testid="divider" />);
    const divider = screen.getByTestId('divider');
    expect(divider).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('renders as decorative when specified', () => {
    render(<Divider decorative data-testid="divider" />);
    const divider = screen.getByTestId('divider');
    expect(divider).toHaveAttribute('role', 'presentation');
  });

  it('applies custom thickness', () => {
    render(<Divider thickness="3px" data-testid="divider" />);
    const divider = screen.getByTestId('divider');
    expect(divider).toHaveStyle({ '--divider-thickness': '3px' });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Divider />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('VisuallyHidden', () => {
  it('renders content that is visually hidden but accessible', () => {
    render(<VisuallyHidden>Hidden content</VisuallyHidden>);
    const content = screen.getByText('Hidden content');
    expect(content).toBeInTheDocument();
    // Content should be in the DOM but visually hidden
    expect(content.className).toContain('visuallyHidden');
  });

  it('renders as different element when specified', () => {
    render(<VisuallyHidden as="div">Hidden content</VisuallyHidden>);
    const content = screen.getByText('Hidden content');
    expect(content.tagName).toBe('DIV');
  });

  it('shows content when focusable and focused', () => {
    render(
      <VisuallyHidden as="button" focusable>
        Skip to content
      </VisuallyHidden>
    );
    const button = screen.getByRole('button');
    expect(button.className).toContain('focusable');
  });

  it('supports ARIA attributes', () => {
    render(
      <VisuallyHidden role="status" aria-live="polite">
        Status update
      </VisuallyHidden>
    );
    const content = screen.getByRole('status');
    expect(content).toHaveAttribute('aria-live', 'polite');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <VisuallyHidden>Screen reader content</VisuallyHidden>
        <button>Visible button</button>
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
