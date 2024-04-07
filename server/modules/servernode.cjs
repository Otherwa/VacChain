const express = require("express");
const { blockchain, startBroadcasting, startMicroservice, stopMicroservice } = require("./microservice.cjs")
const bodyParser = require("body-parser");


const app = express();


const DEFAULT_IP = '127.0.0.1';
const DEFAULT_PORT = 3000;
const [ip = DEFAULT_IP, port = DEFAULT_PORT] = process.argv.slice(2);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/addTransaction', (req, res) => {
    const transactionData = req.body;
    blockchain.addTransaction(transactionData);
    res.status(200).send('Transaction added to pending transactions.');
});

app.post('/addCertificateData', (req, res) => {
    const certificateData = req.body;
    blockchain.addCertificate(certificateData);
    res.status(200).send('Certificate data added to pending transactions.');
});

app.post('/addBlock', (req, res) => {
    const blockData = req.body;
    blockchain.addBlock(blockData);
    res.status(200).send('Block added to the blockchain.');
});

app.get('/getBlocks', (req, res) => {
    const blocks = blockchain.getBlockchainData();
    res.status(200).json(blocks);
})

app.get('/start', async (req, res) => {
    await startMicroservice(ip, port);
    res.status(200).send('Peer Started !')
})

app.get('/stop', async (req, res) => {
    await stopMicroservice(ip, port);
    res.status(200).send('Peer Removed !')
})



module.exports = { app };
