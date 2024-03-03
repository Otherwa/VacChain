const express = require('express');
const User = require('../model/user.cjs');
const CryptoJS = require('crypto-js');

const router = express.Router();

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
  try {
    console.log(req.body);
    const { username, email, password } = req.body;

    const privateKey = CryptoJS.lib.WordArray.random(32).toString(
      CryptoJS.enc.Hex
    );
    const publicKey = CryptoJS.lib.WordArray.random(32).toString(
      CryptoJS.enc.Hex
    );

    const newUser = new User({
      username,
      email,
      password,
      priKey: privateKey,
      pubKey: publicKey,
    });

    await newUser.save();

    res.send('User registered successfully!');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('An error occurred while registering the user.');
  }
});

module.exports = router;
