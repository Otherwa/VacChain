import { createHash } from "crypto";

class Block {
  index: number;
  timestamp: string;
  data: any;
  previousHash: string;
  hash: string;
  nonce: number;

  constructor(
    index: number,
    timestamp: string,
    data: any,
    previousHash: string = ""
  ) {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash(): string {
    const dataString = JSON.stringify(this.data);
    return createHash("sha256")
      .update(
        this.index +
          this.timestamp +
          dataString +
          this.previousHash +
          this.nonce
      )
      .digest("hex");
  }

  // ! irrelevant may remove POS Strategy Price Gas Not Idealized @Otherwa
  mineBlock(difficulty: number): void {
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
  chain: Block[];
  difficulty: number;

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
  }

  createGenesisBlock(): Block {
    return new Block(0, "01/01/2021", "Genesis Block", "0");
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock: Block): void {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
  }

  getBlockchainData(): Block[] {
    return this.chain;
  }
}

export default Blockchain;
