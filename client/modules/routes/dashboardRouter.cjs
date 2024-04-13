const express = require('express');
const router = express.Router();
const axios = require('axios')
const blockchain = require('../../bloc/blockchain.cjs')

const { checkUserSession } = require('../auth/auth.cjs')
const { fetchPeers } = require('../peerservice/peerservice.cjs')

router.get('/dashboard', checkUserSession, async (req, res) => {
  console.log(req.session && req.session.user);
  // request from any server

  const peers = await fetchPeers()
  const randomIndex = Math.floor(Math.random() * peers.length);
  const randomPeer = peers[randomIndex];
  console.log("Randomly selected peer:", randomPeer);
  const response = await axios.get(`http://${randomPeer.host}:8080/getBlocks`);

  res.json({ data: response.data });
});

module.exports = router;
