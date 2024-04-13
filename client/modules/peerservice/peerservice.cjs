require('dotenv').config()

const { Deta } = require('deta');
const deta = Deta(process.env.DETA);

// Initialize Deta Base
const db = deta.Base("PeerNetwork");

async function fetchPeers() {
    const response = await db.fetch({});
    return response.items.map(peer => {
        const { key, ...rest } = peer;
        return rest;
    });
}


module.exports = { fetchPeers }