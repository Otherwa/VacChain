const fs = require("fs");
const p2p = require("p2p");
const { app, blockchain } = require("./modules/client.cjs");



// Default values if arguments are not provided
const DEFAULT_IP = '127.0.0.1';
const DEFAULT_PORT = 4000;

// Retrieve command-line arguments
const [ip = DEFAULT_IP, port = DEFAULT_PORT] = process.argv.slice(2);

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
    await requestDataFromBlockchain(peer);
  }
});


// Function to request data from Blockchain via remote peer
peer.handle.BlockChain = async (payload, done) => {
  try {
    blockchain.readBlockchainDataFromJson(__dirname + "/bloc/peerDump.json");
    blockchain.dumpBlockchainDataToJson(__dirname + "/bloc/peerDump.json");
    if (done) {
      done(null, blockchain.getBlockchainData());
    }
  } catch (error) {
    console.error("Error broadcasting blockchain data:", error);
    if (done) {
      done(error);
    }
  }
};


// Call the function every 10 seconds
async function requestDataFromBlockchain(peer) {
  try {
    console.log("Broadcasting ....")
    setInterval(async () => {
      try {
        const blockchainData = blockchain.getBlockchainData();
        let peers = await peer.wellKnownPeers.get();
        console.log(peers)
        // remove current ip host
        peers = peers.filter(peer => peer.host !== ip || peer.port !== port);
        for (const p of peers) {
          peer.remote(p).run('handle/BlockChain', { blockchain: blockchainData }, (err, result) => {
            console.log("Remote Hit")
            console.log(result);
          });
        }
        console.log("Blockchain data broadcasted successfully to peers");
      } catch (error) {
        console.error("Error broadcasting blockchain data:", error);
      }
    }, 10000); // 10 seconds
  } catch (error) {
    console.error("Error starting broadcasting:", error);
  }
}

// Start the server
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 2000;

// Listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// ! send transctions via and ednspoints connetc to networds add the transsctions to pendind tranasction
// ! on server a guy on window endpoints sees block them togeter and block create
// ! certifacte add to deta storage