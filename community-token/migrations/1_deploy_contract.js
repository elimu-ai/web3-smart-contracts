const ElimuToken = artifacts.require("ElimuToken");
const fs = require('fs');

module.exports = function (deployer) {
  deployer.deploy(ElimuToken);

  // Save ABI
  const contract = JSON.parse(fs.readFileSync('./build/contracts/ElimuToken.json', 'utf8'));
  console.log('Saving ABI:', './abis/ElimuToken.json.abi')
  fs.writeFileSync('./abis/ElimuToken.json.abi', JSON.stringify(contract.abi))
};
