const { getDefaultConfig } = require('expo/metro-config');
const { createProxyMiddleware } = require('http-proxy-middleware');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add proxy middleware to the dev server for web
if (config.server) {
  const originalEnhanceMiddleware = config.server.enhanceMiddleware;
  config.server.enhanceMiddleware = (middleware, server) => {
    const enhanced = originalEnhanceMiddleware 
      ? originalEnhanceMiddleware(middleware, server) 
      : middleware;

    return (req, res, next) => {
      // If the request starts with /api, proxy it to the PHP backend
      if (req.url.startsWith('/api')) {
        return createProxyMiddleware({
          target: 'https://endpoint.daythree.ai/faithMobile/routes',
          changeOrigin: true,
          pathRewrite: {
            '^/api': '', // Remove '/api' from the path before sending to server
          },
          onProxyRes: (proxyRes) => {
            // Ensure CORS headers are present in the response for the browser
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With';
          }
        })(req, res, next);
      }
      return enhanced(req, res, next);
    };
  };
} else {
  // If config.server is not defined, initialize it
  config.server = {
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        if (req.url.startsWith('/api')) {
          return createProxyMiddleware({
            target: 'https://endpoint.daythree.ai/faithMobile/routes',
            changeOrigin: true,
            pathRewrite: {
              '^/api': '',
            },
            onProxyRes: (proxyRes) => {
              proxyRes.headers['Access-Control-Allow-Origin'] = '*';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With';
            }
          })(req, res, next);
        }
        return middleware(req, res, next);
      };
    },
  };
}

module.exports = config;
