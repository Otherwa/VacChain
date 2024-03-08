const p2p = require("p2p");
const { fetchPeers, addPeer, removePeer } = require("./peerservice.cjs");
const { blockchain } = require("../bloc/blockchain.cjs");

const DEFAULT_IP = '127.0.0.1';
const DEFAULT_PORT = 3000;

async function setupPeer(ip, port) {
    const peers = await fetchPeers(ip, port);
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
            blockchain.readBlockchainDataFromJson(__dirname + "/../bloc/serverDump.json");
            blockchain.dumpBlockchainDataToJson(__dirname + "/../bloc/serverDump.json");
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



    return peer;
}

async function startMicroservice(ip, port) {
    try {
        await addPeer({ host: ip, port: port }, `${ip}:${port}`);
        await setupPeer(ip, port);
    } catch (error) {
        console.error("Error starting microservice:", error);
    }
}

async function stopMicroservice(ip, port) {
    try {
        await removePeer(`${ip}:${port}`);
        console.log("Peer removed successfully!");
    } catch (error) {
        console.error("Error removing peer:", error);
    }
}

async function startBroadcasting(peer) {
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

const [ip = DEFAULT_IP, port = DEFAULT_PORT] = process.argv.slice(2);
startMicroservice(ip, port);

process.on('exit', async () => {
    await stopMicroservice(ip, port);
});

module.exports = { blockchain };
