const p2p = require("p2p");
const { fetchPeers, addPeer, removePeer } = require("./peerservice.cjs");
const { blockchain } = require("../bloc/blockchain.cjs");

const DEFAULT_IP = '127.0.0.1';
const DEFAULT_PORT = 3000;

let ip = DEFAULT_IP;
let port = DEFAULT_PORT;
let master = "false";

// Check if there are enough arguments to set IP, port, and master
if (process.argv.length >= 5) {
    ip = process.argv[2];
    port = parseInt(process.argv[3]);
    master = process.argv[4].toLowerCase() === 'true' ? "true" : "false";
}


var broadcastingInterval;

async function stopBroadcasting() {
    clearInterval(broadcastingInterval);
    console.log("Broadcasting stopped successfully!");
}

async function startBroadcasting(peer) {
    try {
        console.log("Broadcasting ....")
        broadcastingInterval = setInterval(async () => {
            try {
                const blockchainData = blockchain.getBlockchainData();
                let peers = await peer.wellKnownPeers.get();
                peers = peers.filter(peer => {
                    return peer.host !== ip || peer.port != port;
                });
                console.log(JSON.stringify(peers))
                const results = await Promise.all(peers.map(async (p) => {
                    return new Promise((resolve, reject) => {
                        peer.remote(p).run('handle/BlockChain', { blockchain: blockchainData }, async (err, result) => {
                            if (err) {
                                reject(err);
                            } else {
                                console.log("Remote Hit")
                                console.log(result)

                                console.log("Mempool " + blockchain.mempool)

                                if (blockchain.mempool.length > 1) {
                                    blockchain.minePendingCertificates()
                                }

                                if (master === "true") {
                                    // ? Read Then dump or dump then read
                                    blockchain.readBlockchainDataFromJson(__dirname + "/../bloc/serverDump.json");
                                    blockchain.dumpBlockchainDataToJson(__dirname + "/../bloc/serverDump.json");

                                } else {
                                    blockchain.replaceChain(result)
                                    blockchain.dumpBlockchainDataToJson(__dirname + "/../bloc/serverDump.json");
                                }

                                resolve(result);
                            }
                        });
                    });
                }));
                console.log("Blockchain data broadcasted successfully to peers");
            } catch (error) {
                console.error("Error broadcasting blockchain data:", error);
            }
        }, 10000); // 10 seconds
    } catch (error) {
        console.error("Error starting broadcasting:", error);
    }
}


async function setupPeer(ip, port) {
    try {
        const peers = await fetchPeers(ip, port);
        console.log(`Master node ${master}`)
        console.log(`Peers : ${peers.toString()}`)
        const peerConfig = {
            host: ip,
            port: port,
            wellKnownPeers: peers,
            serviceInterval: '10s'
        };

        const peer = p2p.peer(peerConfig);

        peer.on('status::joined', () => {
            console.log("Peer joined the network.");
            startBroadcasting(peer);
        });

        peer.on('status::*', status => {
            if (status === 'joined') {
                console.log("Peer joined the network.");
            } else {
                console.log(status);
            }
        });

        peer.handle.BlockChain = async (payload, done) => {
            try {
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

        return { peer };
    } catch (error) {
        console.error("Error setting up peer:", error);
    }
}

async function startMicroservice(ip, port) {
    try {
        await addPeer({ host: ip, port: port }, `${ip}: ${port}`);
        peerObject = await setupPeer(ip, port);
    } catch (error) {
        console.error("Error starting microservice:", error);
    }
}

async function stopMicroservice(ip, port) {
    try {
        stopBroadcasting();
        await removePeer(`${ip}: ${port}`);
        console.log("Peer removed successfully!");
    } catch (error) {
        console.error("Error removing peer:", error);
    }
}



module.exports = { blockchain, stopMicroservice, startMicroservice, fetchPeers };
