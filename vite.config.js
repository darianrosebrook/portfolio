import { sveltekit } from '@sveltejs/kit/vite';
import fs from 'fs';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit(), rawFonts(['.ttf'])],
  optimizeDeps: {
    exclude: ['@vercel/og']
  },
  define: {
    'import.meta.env.VERCEL_ANALYTICS_ID': JSON.stringify(process.env.VERCEL_ANALYTICS_ID)
  }
};
function rawFonts(ext) {
  return {
    name: 'vite-plugin-raw-fonts',
    resolveId(id) {
      return ext.some((e) => id.endsWith(e)) ? id : null;
    },
    transform(code, id) {
      if (ext.some((e) => id.endsWith(e))) {
        const buffer = fs.readFileSync(id);
        return { code: `export default ${JSON.stringify(buffer)}`, map: null };
      }
    }
  };
}

export default config;
