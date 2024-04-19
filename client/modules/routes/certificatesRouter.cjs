
require('dotenv').config()

const { Deta } = require('deta');
const deta = Deta(process.env.DETA);
const stream = require('stream');

const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../model/user.cjs');
const axios = require('axios')
// Initialize Deta Drive
const router = express.Router();
const db = deta.Drive("Docs");

const { blockchain } = require('../../bloc/blockchain.cjs');
const { checkUserSession } = require('../auth/auth.cjs')
const { fetchPeers } = require('../peerservice/peerservice.cjs')

const uploadDirectory = path.join(__dirname, '..', 'uploads');


var hashName;
var extension;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },
  filename: function (req, file, cb) {
    hashName = generateHashName();
    extension = path.extname(file.originalname);
    cb(null, `${hashName}${extension}`);
  },
});

function generateHashName() {
  // Generate a random string
  const randomString = Math.random().toString(36).substring(7);
  // Combine the current date and random string
  const data = new Date().toISOString().replace(/[-:.]/g, '') + randomString;
  // Calculate the SHA-256 hash
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  // Return the hashed filename
  return `${hash}`;
}

const upload = multer({ storage: storage });



router.get('/upload', checkUserSession, (req, res) => {
  res.render('upload');
});

router.post('/upload', checkUserSession, upload.single('file'), async (req, res) => {
  try {
    const uploadedFile = req.file;

    if (!uploadedFile) {
      return res.status(400).send('No file uploaded');
    }

    await db.put(`${hashName}`, { path: uploadDirectory + `\\${hashName}${extension}` });

    const peers = await fetchPeers()
    const randomIndex = Math.floor(Math.random() * peers.length);
    const randomPeer = peers[randomIndex];

    console.log("Randomly selected peer:", randomPeer);
    const response = await axios.post(`http://${randomPeer.host}:8080/addCertificateData`, {
      of: req.session.user.pubKey,
      certificateData: hashName
    });

    console.log(response.data);

    const userId = req.session.user && req.session.user.id; // Bug fixed

    if (!userId) {
      return res.status(401).send('Unauthorized');
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    if (user) {
      await User.findOneAndUpdate(
        { _id: userId },
        { $push: { certifactetransaction: hashName } },
        { new: true }
      );
    } else {
      console.error('User not found');
    }


    res.send('Certificate uploaded successfully!');
  } catch (error) {
    console.error('Error uploading certificate:', error);
    res.status(500).send('Error uploading certificate');
  }
});

router.get('/down/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const blob = await db.get(id);

    const buffer = Buffer.from(await blob.arrayBuffer());

    const readableStream = new stream.PassThrough();
    readableStream.end(buffer);

    res.attachment('download.ext');

    readableStream.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).send('Error downloading file');
  }
});

module.exports = { router, blockchain };