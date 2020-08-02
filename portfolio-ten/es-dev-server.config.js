module.exports = {
  port: 8000,
  watch: true,
  nodeResolve: true,
  appIndex: './index.html',
  plugins: [
    {
      transform(context) {
        if (context.path === '/index.html') {
          const transformedBody = context.body.replace(
            '</head>',
            '<script>window.process = { env: { NODE_ENV: "development", } }</script></head>'
          );
          return { body: transformedBody };
        }
        return false;
      },
    },
  ],
};
