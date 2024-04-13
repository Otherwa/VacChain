
const express = require("express");
const { blockchain, fetchPeers, startMicroservice, stopMicroservice } = require("./microservice.cjs")
const bodyParser = require("body-parser");
const path = require('path')

const app = express();
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

const DEFAULT_IP = '127.0.0.1';
const DEFAULT_PORT = 3000;

let ip = DEFAULT_IP;
let port = DEFAULT_PORT;
let master = "false";

// Check if there are enough arguments to set IP, port, and master
if (process.argv.length >= 5) {
    ip = process.argv[2];
    port = parseInt(process.argv[3]);
    master = process.argv[4].toLowerCase() === 'true' ? "true" : "false";
}


var STATUS = "inactive"

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ? add certifctes
app.post('/addCertificateData', (req, res) => {
    const certificateData = req.body.certificateData;
    blockchain.addCertificatetomeme(certificateData);
    res.status(200).send('Certificate data added to pending transactions.');
});


// ! mine a block only for a centrain user
app.post('/mineBlock', (req, res) => {
    const blockData = req.body;
    blockchain.addBlock(blockData);
    res.status(200).send('Block added to the blockchain.');
});

app.get('/', (req, res) => {
    res.render('dash', { status: STATUS })
})

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
