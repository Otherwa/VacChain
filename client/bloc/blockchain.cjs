const fs = require('fs')

function dumpBlockchainDataToJson(filename) {
  const data = JSON.stringify(this.chain, null, 2);
  fs.writeFileSync(filename, data);
  console.log(`Blockchain data dumped to ${filename}`);
}

module.exports = { dumpBlockchainDataToJson };

