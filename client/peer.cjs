const fs = require("fs");
const p2p = require("p2p");
const { app, blockchain } = require("./modules/client.cjs");



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
peer.handle.BlockChain = async (payload, done, err) => {
  try {
    blockchain.readBlockchainDataFromJson(__dirname + "/../bloc/serverDump.json");
    blockchain.dumpBlockchainDataToJson(__dirname + "/../bloc/serverDump.json");
    const blockchainData = blockchain.getBlockchainData();
    const peers = await peer.wellKnownPeers.get();

    // Wrap the broadcasting process in a promise
    const broadcastPromise = new Promise(async (resolve, reject) => {
      try {
        // Add a 10-second delay
        await new Promise(resolve => setTimeout(resolve, 10000));

        for (const p of peers) {
          await peer.remote(p).run('handle/BlockChain', blockchainData);
        }
        console.log("Blockchain data broadcasted successfully to peers");
        console.warn("Validators");
        console.info(blockchain.validators);
        resolve(); // Resolve the promise when broadcasting is completed
      } catch (error) {
        console.error("Error broadcasting blockchain data:", error);
        reject(error); // Reject the promise if there's an error
      }
    });

    await broadcastPromise; // Wait for the broadcasting process to complete

    if (err) {
      return done(err);
    }
  } catch (error) {
    console.error("Error broadcasting blockchain data:", error);
    return done(error);
  }
};


// Call the function every 10 seconds
setInterval(requestDataFromBlockchain, 10000);

// Start the server
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 2000;

// Listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
