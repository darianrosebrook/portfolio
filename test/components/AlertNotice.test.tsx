import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import { expectNoAccessibilityViolations } from '../axe-helper';
import {
  Container,
  Title,
  BodyContent,
  Icon,
} from '@/ui/components/AlertNotice/AlertNotice';

describe('AlertNotice Components', () => {
  describe('Container', () => {
    it('renders with default props', () => {
      render(
        <Container index={0}>
          <p>Test alert content</p>
        </Container>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent('Test alert content');
    });

    it('applies correct CSS classes based on status and level', () => {
      render(
        <Container index={0} status="warning" level="page">
          <p>Warning message</p>
        </Container>
      );

      const alert = screen.getByRole('alert');
      // CSS modules generate hashed class names, so we check for the pattern
      expect(alert.className).toMatch(/alert/);
      expect(alert.className).toMatch(/alert__page/);
      expect(alert.className).toMatch(/alert__page--warning/);
    });

    it('renders dismiss button when dismissible', () => {
      const mockOnDismiss = vi.fn();

      render(
        <Container index={0} dismissible onDismiss={mockOnDismiss}>
          <p>Dismissible alert</p>
        </Container>
      );

      const dismissButton = screen.getByTitle('Dismiss this alert');
      expect(dismissButton).toBeInTheDocument();
    });

    it('calls onDismiss when dismiss button is clicked', () => {
      const mockOnDismiss = vi.fn();

      render(
        <Container index={1} dismissible onDismiss={mockOnDismiss}>
          <p>Dismissible alert</p>
        </Container>
      );

      const dismissButton = screen.getByTitle('Dismiss this alert');
      fireEvent.click(dismissButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
      expect(mockOnDismiss).toHaveBeenCalledWith(expect.any(Object));
    });

    it('passes data-index to dismiss button', () => {
      const mockOnDismiss = vi.fn();

      render(
        <Container index={42} dismissible onDismiss={mockOnDismiss}>
          <p>Test</p>
        </Container>
      );

      const dismissButton = screen.getByTitle('Dismiss this alert');
      expect(dismissButton).toHaveAttribute('data-index', '42');
    });
  });

  describe('Title', () => {
    it('renders title content', () => {
      render(<Title>Alert Title</Title>);

      const title = screen.getByText('Alert Title');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H6');
    });
  });

  describe('BodyContent', () => {
    it('renders body content', () => {
      render(
        <BodyContent>
          <p>This is the alert body content</p>
        </BodyContent>
      );

      const content = screen.getByText('This is the alert body content');
      expect(content).toBeInTheDocument();
    });
  });

  describe('Icon', () => {
    it('renders correct icon for each status', () => {
      const statuses = ['info', 'success', 'warning', 'danger'] as const;

      statuses.forEach((status) => {
        const { container, unmount } = render(<Icon status={status} />);

        // Check that an SVG icon is rendered
        const icon = container.querySelector('svg');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('aria-hidden', 'true');
        expect(icon).toHaveAttribute('fill', 'currentColor');

        unmount();
      });
    });

    describe('Accessibility', () => {
      it('should have no accessibility violations', async () => {
        const renderResult = render(
          <Container index={0} status="info" level="page">
            <Title>Information Alert</Title>
            <BodyContent>
              <p>This is an important information message.</p>
            </BodyContent>
          </Container>
        );

        await expectNoAccessibilityViolations(renderResult);
      });

      it('should have no accessibility violations when dismissible', async () => {
        const mockOnDismiss = vi.fn();
        const renderResult = render(
          <Container
            index={0}
            status="warning"
            level="section"
            dismissible
            onDismiss={mockOnDismiss}
          >
            <Title>Warning Alert</Title>
            <BodyContent>
              <p>This warning can be dismissed.</p>
            </BodyContent>
          </Container>
        );

        await expectNoAccessibilityViolations(renderResult);
      });

      it('should maintain accessibility across all status variants', async () => {
        const statuses = ['info', 'success', 'warning', 'danger'] as const;

        for (const status of statuses) {
          const renderResult = render(
            <Container index={0} status={status} level="inline">
              <Icon status={status} />
              <Title>{status} Alert</Title>
              <BodyContent>
                <p>This is a {status} message for testing.</p>
              </BodyContent>
            </Container>
          );

          await expectNoAccessibilityViolations(renderResult);
          renderResult.unmount();
        }
      });
    });
  });
});
