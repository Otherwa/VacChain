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
    this.validator = null; // Add validator field for PoS
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
    this.pendingCertificates = [];
    this.difficulty = 2;
    this.miningReward = 100;
    this.validators = []; // Array to store validators for PoS
  }

  createGenesisBlock() {
    return new Block(0, new Date().toISOString(), "Genesis Block", "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addCertificate(certificateHash) {
    this.pendingCertificates.push(certificateHash);
  }

  minePendingCertificates(miningRewardAddress) {
    const lastBlock = this.getLatestBlock();
    const previousHash = lastBlock.hash;

    // Create a new block with the pending certificates
    const block = new Block(
      lastBlock.index + 1,
      Date.now(),
      this.pendingCertificates,
      previousHash
    );

    // Select the validator based on their stake in the network
    const validator = this.selectValidator();

    // Set the validator's address for the block
    block.validator = validator.address;

    // Proof of Work - Mining
    while (!block.hash.startsWith(Array(this.difficulty + 1).join("0"))) {
      block.nonce++;
      block.hash = block.calculateHash();
    }

    // Once mining is successful, add the block to the blockchain
    this.chain.push(block);

    // Reset the pending certificates to only include the mining reward
    this.pendingCertificates = [
      {
        from: null,
        to: miningRewardAddress,
        certificateHash: this.miningReward,
      },
    ];

    console.log("Block successfully mined!");
  }

  // Select a validator based on their stake in the network
  selectValidator() {
    // Implement logic to select a validator based on their stake in the network
    // For example, you can select a validator randomly based on their stake proportionally
    const totalStake = this.validators.reduce((total, validator) => total + validator.stake, 0);
    let randomValue = Math.random() * totalStake;
    for (const validator of this.validators) {
      randomValue -= validator.stake;
      if (randomValue <= 0) {
        return validator;
      }
    }
    // If no validator is selected (which should not happen in practice), return the first validator
    return this.validators[0];
  }

  // Add a new validator to the network
  addValidator(address, stake) {
    this.validators.push({ address, stake });
  }

  // Other methods...

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
    if (newChain.length <= this.chain.length) {
      console.log("Received chain is not longer than the current chain.");
      return;
    }
    if (!this.isChainValid(newChain)) {
      console.log("Received chain is invalid.");
      return;
    }
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
// Blockchain initialization
const blockchain = new Blockchain();

module.exports = { blockchain };

