const { app } = require('./modules/servernode.cjs');

let port = 8080;
let server;

function startServer() {
  server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is already in use. Trying the next port...`);
      port++;
      startServer(); // Retry with the next port
    } else {
      console.error("Server start error:", err);
    }
  });
}

startServer();
