const express = require('express');
const router = express.Router();
const axios = require('axios')

const { Deta } = require('deta');
const deta = Deta(process.env.DETA);

const { checkUserSession } = require('../auth/auth.cjs')
const { fetchPeers } = require('../peerservice/peerservice.cjs')
const db = deta.Drive("Documents");
const User = require('../model/user.cjs');

router.get('/dashboard', checkUserSession, async (req, res) => {
  console.log(req.session && req.session.user);
  // request from any server



  const peers = await fetchPeers()
  const randomIndex = Math.floor(Math.random() * peers.length);
  const randomPeer = peers[randomIndex];
  console.log("Randomly selected peer:", randomPeer);
  const response = await axios.get(`http://${randomPeer.host}:8080/getBlocks`);

  const userData = await User.findById(req.session.user.id);


  res.render('dash', { data: response.data, user: req.session.user, usercert: userData.certifactetransaction });
});

module.exports = router;
