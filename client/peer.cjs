const fs = require("fs");
const p2p = require("p2p");
const { app, blockchain } =  require("./modules/client.cjs");



// Default values if arguments are not provided
const DEFAULT_IP = '127.0.0.1';
const DEFAULT_PORT = 4000;
const DEFAULT_STAKE = 100;

// Retrieve command-line arguments
const [ip = DEFAULT_IP, port = DEFAULT_PORT, stake = DEFAULT_STAKE] = process.argv.slice(2);

const peerConfig = {
  host: ip,
  port: port,
  wellKnownPeers: [{ host: "localhost", port: 3000 }],
  serviceInterval: '10s'
};

const peer = p2p.peer(peerConfig);

peer.on('status::*', async (status) => {
  console.log(status);
  if (status["to"] === "joined") {
    await requestDataFromBlockchain();
  }
});


// Function to request data from Blockchain via remote peer
async function requestDataFromBlockchain() {
  try {
    const result = await new Promise((resolve, reject) => {
      peer.remote({ host: 'localhost', port: 3000 }).run('handle/BlockChain', (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    console.log("Result:", result);
    blockchain.chain = result;
    blockchain.dumpBlockchainDataToJson(__dirname + "/bloc/peerDump.json");
  } catch (error) {
    console.error("Error:", error);
  }
}

// Call the function every 10 seconds
setInterval(requestDataFromBlockchain, 10000);

// Start the server
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 2000;

// Listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
