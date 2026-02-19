/**
 * Development proxy to avoid CORS when calling Google Apps Script.
 * POST requests to /api/rsvp are forwarded to your Web App URL.
 * Only used when running npm start (development).
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  const scriptUrl = process.env.REACT_APP_GOOGLE_SCRIPT_URL;
  if (!scriptUrl) return;

  try {
    const url = new URL(scriptUrl);
    app.use(
      '/api/rsvp',
      createProxyMiddleware({
        target: url.origin,
        changeOrigin: true,
        pathRewrite: { '^/api/rsvp': url.pathname },
        secure: true,
      })
    );
  } catch (e) {
    console.warn('[setupProxy] Invalid REACT_APP_GOOGLE_SCRIPT_URL, proxy not set:', e.message);
  }
};
