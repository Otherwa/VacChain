const express = require('express');
const User = require('../model/user.cjs');
const bcrypt = require('bcrypt');

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).send('User not found');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).send('Invalid password');
    }

    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      pubKey: user.pubKey,
      priKey: user.priKey,
    };

    res.send('Login successful!');
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
