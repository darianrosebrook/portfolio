import merge from 'deepmerge';
import replace from 'rollup-plugin-replace';
import copy from 'rollup-plugin-copy'
// use createSpaConfig for bundling a Single Page App
import { createSpaConfig } from '@open-wc/building-rollup';

const baseConfig = createSpaConfig({
  // use the outputdir option to modify where files are output
  // outputDir: 'dist',

  // development mode creates a non-minified build for debugging or development
  developmentMode: process.env.ROLLUP_WATCH === 'true',

  // set to true to inject the service worker registration into your index.html
  injectServiceWorker: false,
});

export default merge(baseConfig, {
  input: './index.html',
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify( 'production' )
    }),
    copy({
      targets: [
        { src: ['CNAME', '.nojekyll', 'favicon.ico', '404.html'], dest: 'dist/' },
      ]
    })
  ]
});
