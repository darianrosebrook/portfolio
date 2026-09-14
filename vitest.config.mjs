import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    // jsdom exposes requestAnimationFrame only when it pretends to be visual.
    // gsap's ScrollTrigger is registered at module scope by the Animated*
    // primitives and schedules rAF from a timer that can outlive a test file's
    // teardown; with no rAF on the window that throws an unhandled
    // ReferenceError and fails the whole run. Vitest 5 already defaults this to
    // true — pin it so the guarantee is explicit rather than inherited.
    environmentOptions: { jsdom: { pretendToBeVisual: true } },
    setupFiles: './test/setup.ts',
    exclude: [
      'node_modules/**',
      'dist/**',
      '.next/**',
      'test/e2e/**',
      '.caws/worktrees/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), '.'),
    },
  },
  define: {
    global: 'globalThis',
  },
});
