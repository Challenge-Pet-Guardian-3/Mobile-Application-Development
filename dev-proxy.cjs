const http = require('http');

const TARGET_PORT = 8091;
const PROXY_PORT = 8080;

const server = http.createServer((req, res) => {
  const options = {
    hostname: '127.0.0.1',
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `127.0.0.1:${TARGET_PORT}`,
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error(`[Proxy] Erro de conexão com Spring Boot (${TARGET_PORT}):`, err.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'BAD_GATEWAY', message: 'Spring Boot inacessível.' }));
  });

  req.pipe(proxyReq, { end: true });
});

server.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log(`[Proxy] Rodando em http://0.0.0.0:${PROXY_PORT} -> http://127.0.0.1:${TARGET_PORT}`);
});
