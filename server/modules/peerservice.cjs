require('dotenv').config()

const { Deta } = require('deta');
const deta = Deta(process.env.DETA);

// Initialize Deta Base
const db = deta.Base("PeerNetwork");


async function addPeer(obj, key) {
    try {
        await db.put(obj, key);
        console.log("Peer added successfully!");
    } catch (error) {
        console.error("Error storing object:", error);
    }
}


async function removePeer(key) {
    try {
        await db.delete(key);
        console.log("Peer Removed successfully!");
    } catch (error) {
        console.error("Error storing object:", error);
    }
}

async function fetchPeers(ip, port) {
    const response = await db.fetch({});
    // Filter out the peer with the provided IP and port
    const filteredPeers = response.items.filter(peer => peer.host !== ip || peer.port !== port || peer.type !== 'peer');
    return filteredPeers.map(peer => {
        const { key, ...rest } = peer;
        return rest;
    });
}


module.exports = { addPeer, removePeer, fetchPeers }