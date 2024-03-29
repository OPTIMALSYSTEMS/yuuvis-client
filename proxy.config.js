const PROXY_CONFIG = [
  {
    context: [
      '/bpm-engine/**',
      '/api/**',
      '/api-web/**',
      '/dashlet365/**',
      '/office365/**',
      '/predict-api/**',
      '/tenant/**',
      '/login**',
      '/oauth/**',
      '/auth/**',
      '/logout**'
    ],
    target: 'http://127.0.0.1:4300/',
    changeOrigin: true,
    secure: false,
    logLevel: 'debug'
  },
  {
    context: ['/viewer/**'],
    // target: 'http://127.0.0.1:9000/',
    // pathRewrite: { '/viewer': '' },
    target: 'http://127.0.0.1:4300/',
    changeOrigin: true,
    secure: false,
    logLevel: 'debug'
  }
];

module.exports = PROXY_CONFIG;
