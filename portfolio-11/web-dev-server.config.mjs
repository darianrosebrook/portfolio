// import { hmrPlugin, presets } from '@open-wc/dev-server-hmr';

/** Use Hot Module replacement by adding --hmr to the start command */
// const hmr = process.argv.includes('--hmr');

export default /** @type {import('@web/dev-server').DevServerConfig} */ ({
  nodeResolve: true,
  open: '/',
  watch: true,

  /** Compile JS for older browsers. Requires @web/dev-server-esbuild plugin */
  // esbuildTarget: 'auto'

  /** Set appIndex to enable SPA routing */
  appIndex: 'index.html',

  /** Confgure bare import resolve plugin */
  // nodeResolve: {
  //   exportConditions: ['browser', 'development']
  // },

  plugins: [
    {
      transform(context) {
        if (context.path === "/index.html") {
          const transformedBody = context.body.replace(
            "</head>",
            '<script>window.process = { env: { NODE_ENV: "development", API_URL:"http://localhost:4000/api"} }</script></head>'
          );
          return { body: transformedBody };
        }
      },
    },
  
  ],

  // See documentation for all available options
});
