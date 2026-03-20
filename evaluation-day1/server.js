const http = require("http");
const router = require("./modules/router");
const PORT = 3000;



const server = http.createServer(async (req, res) => {
 const start = new Date();
 const originalWriteHead = res.writeHead;

 res.writeHead = function(statusCode, ...args) {
   const end = new Date();
   console.log(`[${start.toISOString()}] ${req.method} ${req.url} - ${statusCode}]`);
   return originalWriteHead.apply(res, [statusCode, ...args]);
 };
    await router(req, res);
});

server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});