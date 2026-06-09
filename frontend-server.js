const express = require('express');
const http = require('http');
const path = require('path');
const app = express();
const PORT = 8080;
const BACKEND_PORT = 3000;

app.use('/api', (req, res) => {
  const options = {
    hostname: 'localhost',
    port: BACKEND_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers }
  };
  delete options.headers.host;

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', () => {
    res.status(502).json({ error: '后端服务不可用' });
  });

  req.pipe(proxyReq);
});

app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`前端服务器运行在 http://localhost:${PORT}`);
});
