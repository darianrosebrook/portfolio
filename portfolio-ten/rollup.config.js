import merge from 'deepmerge';
// use createSpaConfig for bundling a Single Page App
import { createSpaConfig } from '@open-wc/building-rollup';
import url from '@rollup/plugin-url';
import { copy } from '@web/rollup-plugin-copy'
import resolve from 'rollup-plugin-node-resolve';
// use createBasicConfig to do regular JS to JS bundling
// import { createBasicConfig } from '@open-wc/building-rollup';

const baseConfig = createSpaConfig({
  // use the outputdir option to modify where files are output
  // outputDir: 'dist',

  // if you need to support older browsers, such as IE11, set the legacyBuild
  // option to generate an additional build just for this browser
  // legacyBuild: true,

  // development mode creates a non-minified build for debugging or development
  developmentMode: process.env.ROLLUP_WATCH === 'true',

  // set to true to inject the service worker registration into your index.html
  injectServiceWorker: false,
});

export default merge(baseConfig, {
  // if you use createSpaConfig, you can use your index.html as entrypoint,
  // any <script type="module"> inside will be bundled by rollup
  input: './index.html',
  plugins: [
    resolve(),
    url(
      {
        // Where to put files
        destDir: 'dist/assets/',
        // Path to put infront of files (in code)
        publicPath:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:8000/dist/assets/'
            : './assets/',
        // File name once copied
        fileName: '[name][extname]',
        // Kinds of files to process
        include: ['**/*.svg', '**/*.png', '**/*.gif', '**/*.jpg', '**/*.jpeg'],
      },
      {
        // Where to put files
        destDir: 'dist/posts/',
        // Path to put infront of files (in code)
        publicPath:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:8000/dist/posts/'
            : './posts/',
        // File name once copied
        fileName: '[name][extname]',
        // Kinds of files to process
        include: [
          '**/*.svg',
          '**/*.png',
          '**/*.gif',
          '**/*.jpg',
          '**/*.jpeg',
          '**/*.md',
        ],
      }
    ),

    copy({ patterns: '**/*.{svg,jpg,jpeg,json}', exclude: 'node_modules'})
  ],
  // alternatively, you can use your JS as entrypoint for rollup and
  // optionally set a HTML template manually
  // input: './app.js',
});
