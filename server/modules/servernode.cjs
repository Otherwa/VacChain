const express = require("express");
const { blockchain, peer } = require("./microservice.cjs")
const bodyParser = require("body-parser");


const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route to add transaction
app.post('/addTransaction', (req, res) => {
    const transactionData = req.body; // Assuming transaction data is sent in JSON format
    blockchain.addTransaction(transactionData);
    res.status(200).send('Transaction added to pending transactions.');
});

// Route to add certificate data
app.post('/addCertificateData', (req, res) => {
    const certificateData = req.body; // Assuming certificate data is sent in JSON format
    blockchain.addCertificate(certificateData);
    res.status(200).send('Certificate data added to pending transactions.');
});

// Route to add block
app.post('/addBlock', (req, res) => {
    const blockData = req.body; // Assuming block data is sent in JSON format
    blockchain.addBlock(blockData);
    res.status(200).send('Block added to the blockchain.');
});

module.exports = { app, peer };
