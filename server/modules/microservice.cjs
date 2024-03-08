const p2p = require("p2p");
const { fetchPeers, addPeer, removePeer } = require("./peerservice.cjs");
const { blockchain } = require("../bloc/blockchain.cjs");

const DEFAULT_IP = '127.0.0.1';
const DEFAULT_PORT = 3000;

async function setupPeer(ip, port) {
    const peers = await fetchPeers(ip, port);
    console.log(`Peers : ${peers.toString}`)
    const peerConfig = {
        host: ip,
        port: port,
        wellKnownPeers: peers,
        serviceInterval: '10s'
    };

    const peer = p2p.peer(peerConfig);

    // Keep track of whether the peer has joined the network
    let joined = false;

    peer.on('status::joined', () => {
        console.log("Peer joined the network.");
        joined = true;
        startBroadcasting(peer);
    });

    peer.on('status::*', status => {
        if (status === 'joined') {
            console.log("Peer joined the network.");
        } else {
            console.log(status);
        }
    });

    peer.handle.BlockChain = async (payload, done, err) => {
        try {
            blockchain.readBlockchainDataFromJson(__dirname + "/../bloc/serverDump.json");
            blockchain.dumpBlockchainDataToJson(__dirname + "/../bloc/serverDump.json");
            const blockchainData = blockchain.getBlockchainData();
            console.log(blockchainData)
            const peers = await peer.wellKnownPeers.get();

            // Add a 10-second delay
            await new Promise(resolve => setTimeout(resolve, 10000));

            for (const p of peers) {
                await peer.remote(p).run('handle/BlockChain', blockchainData);
            }
            console.log("Blockchain data broadcasted successfully to peers");
            console.warn("Validators");
            console.info(blockchain.validators);
            if (err) {
                return done(err);
            }
        } catch (error) {
            console.error("Error broadcasting blockchain data:", error);
            return done(error);
        }
    };


    return peer;
}

async function startMicroservice(ip, port) {
    try {
        const peer = await setupPeer(ip, port);
        await addPeer({ host: ip, port: port }, `${ip}:${port}`);
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
        setInterval(async () => {
            try {
                const blockchainData = blockchain.getBlockchainData();
                const peers = await peer.wellKnownPeers.get();
                console.log(peers)
                for (const p of peers) {
                    await peer.remote(p).run('handle/BlockChain', blockchainData);
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
