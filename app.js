const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const port = 9000;

app.use('/', createProxyMiddleware({
  target: 'https://api.openai.com',
  changeOrigin: true,
  secure: true,
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.removeHeader('x-forwarded-for');
    proxyReq.removeHeader('x-real-ip');

    Object.keys(req.headers).forEach((header) => {
      proxyReq.setHeader(header, req.headers[header]);
    });
  },
  onProxyRes: (proxyRes, req, res) => {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Headers'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
  },
  onError: (err, req, res) => {
    console.error('Ошибка при проксировании:', err.message);
    res.status(500).json({ error: 'Произошла ошибка на прокси-сервере. Пожалуйста, попробуйте еще раз.' });
  },
  logLevel: 'debug',
  timeout: 10000,
  proxyTimeout: 10000
}));

app.listen(port, () => {
  console.log(`Прокси-сервер запущен по адресу: http://localhost:${port}`);
});
