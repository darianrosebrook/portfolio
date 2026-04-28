import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  BrandProvider,
  useBrand,
  BRANDS,
  type BrandId,
  type DensityId,
  type FontFamilyId,
} from '@/context/BrandContext';

const STORAGE_KEY = 'portfolio-brand-preference';
const AUTO_CYCLE_KEY = 'portfolio-brand-auto-cycle';
const AUTO_CYCLE_INTERVAL_KEY = 'portfolio-brand-auto-cycle-interval';

// The global setup (test/setup.ts) mocks localStorage as vi.fn()s. Per-test
// we drive getItem return values; setItem/removeItem stay as spies.
function mockStoredValues(map: Record<string, string | null>) {
  const ls = window.localStorage as unknown as {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
  };
  ls.getItem.mockReset();
  ls.setItem.mockReset();
  ls.removeItem.mockReset();
  ls.getItem.mockImplementation((key: string) => map[key] ?? null);
}

interface ProbeProps {
  onState: (state: ReturnType<typeof useBrand>) => void;
}

const Probe: React.FC<ProbeProps> = ({ onState }) => {
  const state = useBrand();
  React.useEffect(() => {
    onState(state);
  });
  // The data-brand / data-density attributes are set via useEffect, so reading
  // them through rendered spans would lag by one render. Tests query
  // document.documentElement directly after findByTestId('brand') resolves.
  return (
    <>
      <span data-testid="brand">{state.brand}</span>
      <span data-testid="density">{state.density}</span>
      <span data-testid="heading-font">{state.headingFont}</span>
      <span data-testid="body-font">{state.bodyFont}</span>
      <button onClick={() => state.setBrand('forest')}>set-forest</button>
      <button onClick={() => state.cycleBrand()}>cycle</button>
      <button onClick={() => state.setDensity('tight')}>
        set-density-tight
      </button>
      <button onClick={() => state.setDensity('not-a-density' as DensityId)}>
        set-density-bogus
      </button>
      <button
        onClick={() => state.setHeadingFont('not-a-font' as FontFamilyId)}
      >
        set-heading-bogus
      </button>
      <button onClick={() => state.setBodyFont('newsreader')}>
        set-body-newsreader
      </button>
      <button onClick={() => state.resetBrand()}>reset</button>
      <button onClick={() => state.setBrand('not-a-brand' as BrandId)}>
        set-brand-bogus
      </button>
    </>
  );
};

beforeEach(() => {
  mockStoredValues({});
  document.documentElement.removeAttribute('data-brand');
  document.documentElement.removeAttribute('data-density');
});

describe('BrandProvider hydration', () => {
  it('boots to default brand and its preferred density/fonts when localStorage is empty', async () => {
    render(
      <BrandProvider>
        <Probe onState={() => {}} />
      </BrandProvider>
    );

    expect(await screen.findByTestId('brand')).toHaveTextContent('default');
    expect(screen.getByTestId('density')).toHaveTextContent('default');
    expect(screen.getByTestId('heading-font')).toHaveTextContent('inter');
    expect(screen.getByTestId('body-font')).toHaveTextContent('inter');
    expect(document.documentElement.getAttribute('data-brand')).toBe('default');
    expect(document.documentElement.getAttribute('data-density')).toBe(
      'default'
    );
  });

  it('hydrates brand from localStorage and applies that brand’s preferred density/fonts', async () => {
    mockStoredValues({ [STORAGE_KEY]: 'midnight' });

    render(
      <BrandProvider>
        <Probe onState={() => {}} />
      </BrandProvider>
    );

    expect(await screen.findByTestId('brand')).toHaveTextContent('midnight');
    // midnight defines density: 'tight', headingFont: 'inter', bodyFont: 'monaspace'
    expect(screen.getByTestId('density')).toHaveTextContent('tight');
    expect(screen.getByTestId('heading-font')).toHaveTextContent('inter');
    expect(screen.getByTestId('body-font')).toHaveTextContent('monaspace');
  });

  it('falls back to default when stored brand is unknown', async () => {
    mockStoredValues({ [STORAGE_KEY]: 'made-up-brand' });

    render(
      <BrandProvider>
        <Probe onState={() => {}} />
      </BrandProvider>
    );

    expect(await screen.findByTestId('brand')).toHaveTextContent('default');
  });

  it('honours initialBrand prop over localStorage', async () => {
    mockStoredValues({ [STORAGE_KEY]: 'midnight' });

    render(
      <BrandProvider initialBrand="forest">
        <Probe onState={() => {}} />
      </BrandProvider>
    );

    expect(await screen.findByTestId('brand')).toHaveTextContent('forest');
    // forest defines density: 'spacious', headingFont: 'newsreader', bodyFont: 'newsreader'
    expect(screen.getByTestId('density')).toHaveTextContent('spacious');
    expect(screen.getByTestId('heading-font')).toHaveTextContent('newsreader');
    expect(screen.getByTestId('body-font')).toHaveTextContent('newsreader');
  });

  it('hydrates auto-cycle preferences from localStorage when valid', async () => {
    mockStoredValues({
      [AUTO_CYCLE_KEY]: 'true',
      [AUTO_CYCLE_INTERVAL_KEY]: '4000',
    });

    let captured: ReturnType<typeof useBrand> | null = null;
    render(
      <BrandProvider>
        <Probe onState={(s) => (captured = s)} />
      </BrandProvider>
    );

    // wait one tick for hydration effect
    await screen.findByTestId('brand');
    expect(captured!.isAutoCycling).toBe(true);
    expect(captured!.autoCycleInterval).toBe(4000);
  });

  it('rejects auto-cycle interval below the 1000ms floor', async () => {
    mockStoredValues({
      [AUTO_CYCLE_KEY]: 'true',
      [AUTO_CYCLE_INTERVAL_KEY]: '500', // below floor
    });

    let captured: ReturnType<typeof useBrand> | null = null;
    render(
      <BrandProvider>
        <Probe onState={(s) => (captured = s)} />
      </BrandProvider>
    );

    await screen.findByTestId('brand');
    expect(captured!.autoCycleInterval).toBe(5000); // unchanged from default
  });
});

describe('BrandProvider applyBrand atomicity', () => {
  it('setBrand updates brand + density + fonts in one tick (no brand-watch effect needed)', async () => {
    const user = userEvent.setup();
    render(
      <BrandProvider>
        <Probe onState={() => {}} />
      </BrandProvider>
    );

    await screen.findByTestId('brand');
    await user.click(screen.getByText('set-forest'));

    // forest: density='spacious', headingFont='newsreader', bodyFont='newsreader'
    expect(screen.getByTestId('brand')).toHaveTextContent('forest');
    expect(screen.getByTestId('density')).toHaveTextContent('spacious');
    expect(screen.getByTestId('heading-font')).toHaveTextContent('newsreader');
    expect(screen.getByTestId('body-font')).toHaveTextContent('newsreader');
    expect(document.documentElement.getAttribute('data-brand')).toBe('forest');
    expect(document.documentElement.getAttribute('data-density')).toBe(
      'spacious'
    );
  });

  it('cycleBrand walks the BRANDS list and applies each brand’s preferred density', async () => {
    const user = userEvent.setup();
    render(
      <BrandProvider>
        <Probe onState={() => {}} />
      </BrandProvider>
    );

    await screen.findByTestId('brand');
    expect(screen.getByTestId('brand')).toHaveTextContent('default');

    // First click cycles default → corporate (compact)
    await user.click(screen.getByText('cycle'));
    expect(screen.getByTestId('brand')).toHaveTextContent('corporate');
    expect(screen.getByTestId('density')).toHaveTextContent('compact');

    // Second click cycles corporate → forest (spacious)
    await user.click(screen.getByText('cycle'));
    expect(screen.getByTestId('brand')).toHaveTextContent('forest');
    expect(screen.getByTestId('density')).toHaveTextContent('spacious');
  });
});

describe('BrandProvider setter validation', () => {
  it('setBrand warns and ignores unknown brand ids', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const user = userEvent.setup();

    render(
      <BrandProvider>
        <Probe onState={() => {}} />
      </BrandProvider>
    );
    await screen.findByTestId('brand');

    await user.click(screen.getByText('set-brand-bogus'));

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Unknown brand: not-a-brand')
    );
    expect(screen.getByTestId('brand')).toHaveTextContent('default');
    warn.mockRestore();
  });

  it('setDensity warns and ignores unknown density ids', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const user = userEvent.setup();

    render(
      <BrandProvider>
        <Probe onState={() => {}} />
      </BrandProvider>
    );
    await screen.findByTestId('brand');

    // First a valid density to confirm baseline change works
    await user.click(screen.getByText('set-density-tight'));
    expect(screen.getByTestId('density')).toHaveTextContent('tight');

    // Then bogus
    await user.click(screen.getByText('set-density-bogus'));
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Unknown density: not-a-density')
    );
    expect(screen.getByTestId('density')).toHaveTextContent('tight');
    warn.mockRestore();
  });

  it('setHeadingFont warns and ignores unknown font ids', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const user = userEvent.setup();

    render(
      <BrandProvider>
        <Probe onState={() => {}} />
      </BrandProvider>
    );
    await screen.findByTestId('brand');

    await user.click(screen.getByText('set-heading-bogus'));
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Unknown heading font: not-a-font')
    );
    expect(screen.getByTestId('heading-font')).toHaveTextContent('inter');
    warn.mockRestore();
  });

  it('setBodyFont applies a valid font value', async () => {
    const user = userEvent.setup();
    render(
      <BrandProvider>
        <Probe onState={() => {}} />
      </BrandProvider>
    );
    await screen.findByTestId('brand');

    await user.click(screen.getByText('set-body-newsreader'));
    expect(screen.getByTestId('body-font')).toHaveTextContent('newsreader');
  });
});

describe('BrandProvider resetBrand', () => {
  it('resets brand, density, and fonts to defaults', async () => {
    const user = userEvent.setup();
    render(
      <BrandProvider initialBrand="midnight">
        <Probe onState={() => {}} />
      </BrandProvider>
    );

    await screen.findByTestId('brand');
    expect(screen.getByTestId('brand')).toHaveTextContent('midnight');
    expect(screen.getByTestId('density')).toHaveTextContent('tight');

    await user.click(screen.getByText('reset'));

    expect(screen.getByTestId('brand')).toHaveTextContent('default');
    expect(screen.getByTestId('density')).toHaveTextContent('default');
    expect(screen.getByTestId('heading-font')).toHaveTextContent('inter');
    expect(screen.getByTestId('body-font')).toHaveTextContent('inter');
  });
});

describe('BrandProvider DOM side-effects', () => {
  it('applies data-brand and data-density attributes to <html>', async () => {
    render(
      <BrandProvider initialBrand="canary">
        <Probe onState={() => {}} />
      </BrandProvider>
    );

    await screen.findByTestId('brand');
    expect(document.documentElement.getAttribute('data-brand')).toBe('canary');
    expect(document.documentElement.getAttribute('data-density')).toBe(
      'default' // canary defines density: 'default'
    );
  });

  it('persists brand selection to localStorage when changed', async () => {
    const user = userEvent.setup();
    const ls = window.localStorage as unknown as {
      setItem: ReturnType<typeof vi.fn>;
    };

    render(
      <BrandProvider>
        <Probe onState={() => {}} />
      </BrandProvider>
    );
    await screen.findByTestId('brand');

    ls.setItem.mockClear();
    await user.click(screen.getByText('set-forest'));

    expect(ls.setItem).toHaveBeenCalledWith(STORAGE_KEY, 'forest');
  });
});

describe('BRANDS metadata', () => {
  it('every brand declares a density and font preferences (consumed by applyBrand)', () => {
    for (const brand of BRANDS) {
      expect(brand.density).toBeDefined();
      expect(brand.headingFont).toBeDefined();
      expect(brand.bodyFont).toBeDefined();
    }
  });
});

// Use act for any imperative re-renders we need that aren't covered by user events.
// (Currently unused; kept as a hook for future tests.)
void act;
