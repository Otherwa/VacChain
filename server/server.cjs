const { app } = require('./modules/servernode.cjs');

// Start the server
const server = app.listen(8080, () => {
  console.log('Server running on port 8080');
});
