const ElimuDisperse = artifacts.require("ElimuDisperse");
const fs = require('fs');

module.exports = function (deployer, network) {
  console.log('network:', network)

  let isDryRun = network.endsWith('-fork')
  if (!isDryRun) {
    // Save the contract's ABI
    const contractJson = JSON.parse(fs.readFileSync('./build/contracts/' + ElimuDisperse.contractName + '.json', 'utf8'));
    console.log('Saving ABI:', './abis/' + network + '/' + ElimuDisperse.contractName + '.json.abi')
    fs.writeFileSync('./abis/' + network + '/' + ElimuDisperse.contractName + '.json.abi', JSON.stringify(contractJson.abi))
  }

  // Deploy the contract
  console.log('contractName:', ElimuDisperse.contractName)
  deployer.deploy(ElimuDisperse);
};
