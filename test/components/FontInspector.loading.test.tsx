import React, { useEffect } from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import {
  InspectorProvider,
  useInspector,
} from '@/ui/modules/FontInspector/FontInspector';
import { InspectorControls } from '@/ui/modules/FontInspector/InspectorControls';
import { SymbolCanvasSVG } from '@/ui/modules/FontInspector/SymbolCanvasSVG';

let inspector: ReturnType<typeof useInspector>;

async function fontResponse(url: string): Promise<Response> {
  const bytes = await readFile(`${process.cwd()}/public${url}`);
  return {
    ok: true,
    status: 200,
    arrayBuffer: async () =>
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  } as Response;
}

function Harness() {
  const state = useInspector();
  useEffect(() => {
    inspector = state;
  });
  return (
    <>
      <InspectorControls />
      <SymbolCanvasSVG />
    </>
  );
}

function mount() {
  return render(
    <React.StrictMode>
      <InspectorProvider>
        <Harness />
      </InspectorProvider>
    </React.StrictMode>
  );
}

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    () => ({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 640,
      bottom: 480,
      width: 640,
      height: 480,
      toJSON: () => ({}),
    })
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('FontInspector font load and recovery lifecycle', () => {
  it('keeps the picker through HTTP failure, switches to Inter, and retries only the failed Nohemi request without StrictMode duplicates', async () => {
    let failNohemi = true;
    const failedBody = vi.fn();
    const network = vi.fn((url: string) =>
      url.includes('Nohemi') && failNohemi
        ? Promise.resolve({
            ok: false,
            status: 503,
            arrayBuffer: failedBody,
          } as unknown as Response)
        : fontResponse(url)
    );
    vi.stubGlobal('fetch', network);
    const view = mount();
    const picker = screen.getByRole('combobox', { name: 'Font' });
    expect(picker).toBeEnabled();
    expect(screen.getByRole('status')).toHaveTextContent('Loading Nohemi');
    await waitFor(() => expect(inspector.fonts[0].loadState).toBe('error'));
    await waitFor(() => expect(inspector.fonts[1].loadState).toBe('loaded'));
    expect(network.mock.calls.map(([url]) => url).sort()).toEqual(
      [
        '/fonts/Nohemi-VF.ttf',
        '/fonts/InterVariable.ttf',
        '/fonts/MonaspaceNeonVF.ttf',
        '/fonts/Newsreader-VF.ttf',
      ].sort()
    );
    expect(failedBody).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Unable to load Nohemi: Request failed (HTTP 503)'
    );
    expect(screen.getByTitle('Copy Glyph')).toBeDisabled();
    expect(screen.getByTitle('Copy Glyph')).toHaveTextContent('—');
    expect(inspector.fontInstance).toBeNull();
    expect(inspector.geometryCache).toBeNull();
    expect(inspector.detectedFeatures.size).toBe(0);
    expect(view.container.querySelector('#glyph path')).toBeNull();
    fireEvent.change(picker, { target: { value: '1' } });
    expect(inspector.currentFontIndex).toBe(1);
    expect(inspector.font).toBe(inspector.fonts[1].font);
    expect(inspector.glyph?.name).toBe('A');
    expect(view.container.querySelector('#glyph path')).not.toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
    fireEvent.change(picker, { target: { value: '0' } });
    expect(view.container.querySelector('#glyph path')).toBeNull();
    failNohemi = false;
    const retry = inspector.retryCurrentFont;
    fireEvent.click(screen.getByRole('button', { name: 'Retry Nohemi' }));
    act(() => retry());
    expect(screen.getByRole('status')).toHaveTextContent('Loading Nohemi');
    await waitFor(() => expect(inspector.fonts[0].loadState).toBe('loaded'));
    expect(
      network.mock.calls.filter(([url]) => url.includes('Nohemi')).length
    ).toBe(2);
    expect(
      network.mock.calls.filter(([url]) => url.includes('InterVariable')).length
    ).toBe(1);
    expect(inspector.currentFontIndex).toBe(0);
    expect(inspector.font).toBe(inspector.fonts[0].font);
    expect(inspector.glyph?.name).toBe('A');
    expect(inspector.fonts[0].loadError).toBeNull();
    expect(view.container.querySelector('#glyph path')).not.toBeNull();
    expect(screen.getByTitle('Copy Glyph')).toBeEnabled();
  });

  it('reports invalid font bytes as unavailable while other fonts complete independently', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        url.includes('Nohemi')
          ? Promise.resolve({
              ok: true,
              status: 200,
              arrayBuffer: async () => new ArrayBuffer(4),
            } as Response)
          : fontResponse(url)
      )
    );
    const view = mount();
    await waitFor(() => expect(inspector.fonts[0].loadState).toBe('error'));
    expect(inspector.fonts[0].loadError).toBe('Unknown font format');
    expect(screen.getByRole('status')).toHaveTextContent(
      'Unable to load Nohemi: Unknown font format'
    );
    expect(view.container.querySelector('#glyph path')).toBeNull();
    await waitFor(() => expect(inspector.fonts[1].loadState).toBe('loaded'));
    fireEvent.change(screen.getByRole('combobox', { name: 'Font' }), {
      target: { value: '1' },
    });
    expect(inspector.glyph?.name).toBe('A');
    expect(view.container.querySelector('#glyph path')).not.toBeNull();
  });

  it('aborts an unmounted pending request and ignores its late response after a fresh provider fails', async () => {
    let firstProvider = true;
    let resolveOldResponse!: (response: Response) => void;
    const oldResponse = new Promise<Response>((resolve) => {
      resolveOldResponse = resolve;
    });
    const network = vi.fn((url: string, _options: RequestInit) => {
      if (!url.includes('Nohemi')) return fontResponse(url);
      return firstProvider
        ? oldResponse
        : Promise.resolve({ ok: false, status: 404 } as Response);
    });
    vi.stubGlobal('fetch', network);
    const first = mount();
    await waitFor(() =>
      expect(
        network.mock.calls.filter(([url]) => url.includes('Nohemi')).length
      ).toBe(1)
    );
    const signal = network.mock.calls.find(([url]) =>
      url.includes('Nohemi')
    )![1].signal!;
    expect(signal.aborted).toBe(false);
    await waitFor(() => expect(inspector.fonts[1].loadState).toBe('loaded'));
    expect(inspector.fonts[0].loadState).toBe('loading');
    first.unmount();
    expect(signal.aborted).toBe(true);
    firstProvider = false;
    const fresh = mount();
    await waitFor(() =>
      expect(inspector.fonts[0].loadError).toBe('Request failed (HTTP 404)')
    );
    const body = vi.fn(async () =>
      (await fontResponse('/fonts/Nohemi-VF.ttf')).arrayBuffer()
    );
    await act(async () => {
      resolveOldResponse({
        ok: true,
        status: 200,
        arrayBuffer: body,
      } as unknown as Response);
      await oldResponse;
    });
    expect(body).not.toHaveBeenCalled();
    expect(inspector.fonts[0].loadState).toBe('error');
    expect(inspector.font).toBeNull();
    expect(inspector.glyph).toBeNull();
    expect(fresh.container.querySelector('#glyph path')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('HTTP 404');
  });

  it('starts no requests after an immediate unmount before the deferred launch', async () => {
    const network = vi.fn(fontResponse);
    vi.stubGlobal('fetch', network);
    const view = mount();
    view.unmount();
    await act(async () => {
      await Promise.resolve();
    });
    expect(network).not.toHaveBeenCalled();
  });
});
