const p2p = require("p2p");
const { fetchPeers, addPeer, removePeer } = require("./peerservice.cjs");
const { blockchain } = require("../bloc/blockchain.cjs");

const DEFAULT_IP = '127.0.0.1';
const DEFAULT_PORT = 3000;
const [ip = DEFAULT_IP, port = DEFAULT_PORT, master = "false"] = process.argv.slice(3);

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
                // remove current ip host
                peers = peers.filter(peer => peer.host !== ip || peer.port !== port);
                for (const p of peers) {
                    peer.remote(p).run('handle/BlockChain', { blockchain: blockchainData }, (err, result) => {
                        console.log("Remote Hit")
                        console.log(result)
                        if (master === "true") {
                            blockchain.readBlockchainDataFromJson(__dirname + "/../bloc/serverDump.json");
                            blockchain.dumpBlockchainDataToJson(__dirname + "/../bloc/serverDump.json");
                        } else {
                            blockchain.replaceChain(result)
                            blockchain.dumpBlockchainDataToJson(__dirname + "/../bloc/serverDump.json");
                        }
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
