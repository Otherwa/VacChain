const p2p = require("p2p");
const { blockchain } = require("../bloc/blockchain.cjs");

// Default values if arguments are not provided
const DEFAULT_IP = '127.0.0.1';
const DEFAULT_PORT = 3000;

// Retrieve command-line arguments
const [ip = DEFAULT_IP, port = DEFAULT_PORT] = process.argv.slice(2);

// Configure peer
const peerConfig = {
    host: ip,
    port: port,
    wellKnownPeers: [{ host: "localhost", port: 4000 }],
    serviceInterval: '10s'
};

// Create peer
const peer = p2p.peer(peerConfig);

// Event handler for peer status
peer.on('status::*', status => console.log(status));

// Handler for BlockChain message
peer.handle.BlockChain = (payload, done, err) => {
    blockchain.readBlockchainDataFromJson(__dirname + "/../bloc/serverDump.json");
    blockchain.dumpBlockchainDataToJson(__dirname + "/../bloc/serverDump.json");
    done(null, blockchain.getBlockchainData());
    console.warn("Validators");
    console.info(blockchain.validators);
    if (err) {
        return done(err);
    }
};

module.exports = { peer, blockchain };
