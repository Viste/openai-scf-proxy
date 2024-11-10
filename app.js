const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const https = require('https');

const app = express();
const port = 9000;


const agent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false,
});

app.use('/', createProxyMiddleware({
  target: 'https://api.openai.com',
  changeOrigin: true,
  secure: true,
  timeout: 100000, 
  proxyTimeout: 100000, 
  agent: agent,
  logLevel: 'warn',
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.removeHeader('x-forwarded-for');
    proxyReq.removeHeader('x-real-ip');
    proxyReq.setHeader('Connection', 'keep-alive'); 
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
    if (!res.headersSent) {
      res.status(502).json({ error: 'Проблема с проксированием запроса, пожалуйста, попробуйте еще раз позже.' });
    }
  },
}));


app.listen(port, () => {
  console.log(`Прокси-сервер запущен по адресу: http://0.0.0.0:${port}`);
});
