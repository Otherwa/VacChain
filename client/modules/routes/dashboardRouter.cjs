const express = require('express');
const router = express.Router();

router.get('/dashboard', (req, res) => {
  console.log(req.session && req.session.user); // Bug fixed
  res.render('dashboard');
});

module.exports = router;
