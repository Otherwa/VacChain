const express = require('express');
const router = express.Router();
const blockchain = require('../../bloc/blockchain.cjs')

router.get('/dashboard', (req, res) => {
  console.log(req.session && req.session.user); // Bug fixed
  res.json({ data: blockchain })
});

module.exports = router;
