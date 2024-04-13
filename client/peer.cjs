const { app } = require('./modules/client.cjs')


// Start the server
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 2000;

// Listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
