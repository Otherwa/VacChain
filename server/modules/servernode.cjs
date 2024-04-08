
const express = require("express");
const { blockchain, fetchPeers, startMicroservice, stopMicroservice } = require("./microservice.cjs")
const bodyParser = require("body-parser");
const path = require('path')

const app = express();
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

const DEFAULT_IP = '127.0.0.1';
const DEFAULT_PORT = 3000;
const [ip = DEFAULT_IP, port = DEFAULT_PORT, master = "false"] = process.argv.slice(3);

var STATUS = "inactive"

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

app.get('/', (req, res) => {
    res.render('dash', { status: STATUS })
})

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
    STATUS = "active";
    res.status(200).send('Peer Started !')
})

app.get('/stop', async (req, res) => {
    await stopMicroservice(ip, port);
    STATUS = "inactive";
    res.status(200).send('Peer Removed !')
})


app.get('/peers', async (req, res) => {
    const peers = await fetchPeers(ip, port);
    console.log(peers)
    res.status(200).json(peers);
})


module.exports = { app };
