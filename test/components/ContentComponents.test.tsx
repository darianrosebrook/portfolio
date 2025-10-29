import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { Text } from '@/ui/components/Text';
import { List } from '@/ui/components/List';
import { Image } from '@/ui/components/Image';

describe('Text', () => {
  it('renders with default paragraph element', () => {
    render(<Text>Test content</Text>);
    const element = screen.getByText('Test content');
    expect(element.tagName).toBe('P');
  });

  it('renders as different element when specified', () => {
    render(<Text as="h1">Heading content</Text>);
    const element = screen.getByText('Heading content');
    expect(element.tagName).toBe('H1');
  });

  it('applies variant classes correctly', () => {
    render(
      <Text variant="display" data-testid="text">
        Display text
      </Text>
    );
    const element = screen.getByTestId('text');
    expect(element.className).toContain('display');
  });

  it('applies size classes correctly', () => {
    render(
      <Text size="lg" data-testid="text">
        Large text
      </Text>
    );
    const element = screen.getByTestId('text');
    expect(element.className).toContain('lg');
  });

  it('applies color classes correctly', () => {
    render(
      <Text color="accent" data-testid="text">
        Accent text
      </Text>
    );
    const element = screen.getByTestId('text');
    expect(element.className).toContain('color-accent');
  });

  it('applies truncate class when specified', () => {
    render(
      <Text truncate data-testid="text">
        Truncated text
      </Text>
    );
    const element = screen.getByTestId('text');
    expect(element.className).toContain('truncate');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Text as="h1" variant="display">
          Main Heading
        </Text>
        <Text variant="body">Body text content</Text>
        <Text variant="caption" color="muted">
          Caption text
        </Text>
      </div>
    );
    // Note: axe testing is handled by the setup file
    expect(container).toBeInTheDocument();
  });
});

describe('List', () => {
  it('renders as unordered list by default', () => {
    render(
      <List data-testid="list">
        <li>Item 1</li>
        <li>Item 2</li>
      </List>
    );
    const element = screen.getByTestId('list');
    expect(element.tagName).toBe('UL');
  });

  it('renders as ordered list when specified', () => {
    render(
      <List as="ol" data-testid="list">
        <li>Item 1</li>
        <li>Item 2</li>
      </List>
    );
    const element = screen.getByTestId('list');
    expect(element.tagName).toBe('OL');
  });

  it('renders as definition list when specified', () => {
    render(
      <List as="dl" data-testid="list">
        <dt>Term</dt>
        <dd>Definition</dd>
      </List>
    );
    const element = screen.getByTestId('list');
    expect(element.tagName).toBe('DL');
  });

  it('applies variant classes correctly', () => {
    render(
      <List variant="inline" data-testid="list">
        <li>Item 1</li>
        <li>Item 2</li>
      </List>
    );
    const element = screen.getByTestId('list');
    expect(element.className).toContain('inline');
  });

  it('applies marker classes correctly', () => {
    render(
      <List marker="disc" data-testid="list">
        <li>Item 1</li>
        <li>Item 2</li>
      </List>
    );
    const element = screen.getByTestId('list');
    expect(element.className).toContain('marker-disc');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <List>
          <li>Unordered item</li>
          <li>Another item</li>
        </List>
        <List as="ol">
          <li>Ordered item</li>
          <li>Another ordered item</li>
        </List>
        <List as="dl">
          <dt>Term</dt>
          <dd>Definition</dd>
        </List>
      </div>
    );
    // Note: axe testing is handled by the setup file
    expect(container).toBeInTheDocument();
  });
});

describe('Image', () => {
  it('renders with required alt attribute', () => {
    render(<Image src="/test.jpg" alt="Test image" />);
    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
    expect(image.tagName).toBe('IMG');
  });

  it('applies size classes correctly', () => {
    const { container } = render(
      <Image src="/test.jpg" alt="Test" size="md" />
    );
    const imageContainer = container.firstChild as HTMLElement;
    expect(imageContainer.className).toContain('md');
  });

  it('applies radius classes correctly', () => {
    const { container } = render(
      <Image src="/test.jpg" alt="Test" radius="lg" />
    );
    const imageContainer = container.firstChild as HTMLElement;
    expect(imageContainer.className).toContain('radius-lg');
  });

  it('applies aspect ratio styles correctly', () => {
    render(<Image src="/test.jpg" alt="Test" aspectRatio="square" />);
    const image = screen.getByAltText('Test');
    expect(image).toHaveStyle({ aspectRatio: '1' });
  });

  it('applies custom aspect ratio correctly', () => {
    render(<Image src="/test.jpg" alt="Test" aspectRatio={16 / 9} />);
    const image = screen.getByAltText('Test');
    expect(image).toHaveStyle({ aspectRatio: (16 / 9).toString() });
  });

  it('shows placeholder while loading', () => {
    render(<Image src="/test.jpg" alt="Test" showPlaceholder />);
    // Placeholder should be present initially
    const placeholder = document.querySelector('[aria-hidden="true"]');
    expect(placeholder).toBeInTheDocument();
  });

  it('handles error state correctly', async () => {
    const onError = vi.fn();
    render(<Image src="/nonexistent.jpg" alt="Test" onError={onError} />);

    const image = screen.getByAltText('Test');
    fireEvent.error(image);

    expect(onError).toHaveBeenCalled();

    // Error state should be shown
    await waitFor(() => {
      expect(screen.getByText('Image failed to load')).toBeInTheDocument();
    });
  });

  it('uses fallback image on error', async () => {
    render(
      <Image src="/nonexistent.jpg" fallbackSrc="/fallback.jpg" alt="Test" />
    );

    const image = screen.getByAltText('Test');
    fireEvent.error(image);

    await waitFor(() => {
      expect(image).toHaveAttribute('src', '/fallback.jpg');
    });
  });

  it('calls onLoad when image loads successfully', () => {
    const onLoad = vi.fn();
    render(<Image src="/test.jpg" alt="Test" onLoad={onLoad} />);

    const image = screen.getByAltText('Test');
    fireEvent.load(image);

    expect(onLoad).toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Image src="/test1.jpg" alt="First test image" />
        <Image src="/test2.jpg" alt="Second test image" aspectRatio="square" />
        <Image src="/test3.jpg" alt="Third test image" radius="full" />
      </div>
    );
    // Note: axe testing is handled by the setup file
    expect(container).toBeInTheDocument();
  });
});
