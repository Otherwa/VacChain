const { createHash } = require("crypto");
const fs = require("fs");
const moment = require('moment');

class Block {
  constructor(index, timestamp, data, previousHash = "") {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    const dataString = JSON.stringify(this.data);
    return createHash("sha256")
      .update(
        this.index +
        this.timestamp +
        dataString +
        this.previousHash +
        this.nonce +
        this.validator // Include validator in hash calculation for PoS
      )
      .digest("hex");
  }

  mineBlock(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`Block mined: ${this.hash}`);
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.mempool = []

    console.log(this.chain)
  }

  createGenesisBlock() {
    return new Block(0, new Date().toISOString(), "Genesis Block", "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addCertificate(certificateHash) {
    return {
      of: certificateHash.of,
      hash: certificateHash.certificateData
    }
  }

  addCertificatetomeme(certificateHash) {
    this.mempool.push(this.addCertificate(certificateHash));
  }

  minePendingCertificates() {
    const lastBlock = this.getLatestBlock();
    const previousHash = lastBlock.hash;

    // Create a new block with the pending certificates
    const block = new Block(
      lastBlock.index + 1,
      Date.now(),
      this.mempool,
      previousHash
    );


    // Proof of Work - Mining
    while (!block.hash.startsWith(Array(this.difficulty + 1).join("0"))) {
      block.nonce++;
      block.hash = block.calculateHash();
    }

    // Once mining is successful, add the block to the blockchain
    this.chain.push(block);
    console.log("Block successfully mined! Limit 3");

    this.mempool = []
  }



  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  replaceChain(newChain) {
    console.log("Replacing current chain with received chain.");
    this.chain = newChain;
  }

  getBlockchainData() {
    return this.chain;
  }

  dumpBlockchainDataToJson(filename) {
    const data = JSON.stringify(this.chain, null, 2);
    fs.writeFileSync(filename, data);
    console.log(`Blockchain data dumped to ${filename}`);
  }

  readBlockchainDataFromJson(filename) {
    try {
      const data = fs.readFileSync(filename, "utf-8");
      const parsedData = JSON.parse(data);
      this.chain = parsedData;
      console.log(`Blockchain data read from ${filename}`);
    } catch (error) {
      console.error(`Error reading blockchain data from ${filename} Now Creating 💀`);
    }
  }
}

const blockchain = new Blockchain();

module.exports = { blockchain };

