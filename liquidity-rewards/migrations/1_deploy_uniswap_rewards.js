const UniswapPoolRewards = artifacts.require("UniswapPoolRewards");
const fs = require('fs');

module.exports = function (deployer, network) {
  console.log('deployer.options.from:', deployer.options.from);
  console.log('network:', network);

  const isDryRun = network.endsWith('-fork') || network.endsWith('coverage');
  if (!isDryRun) {
    // Save the contract's ABI
    const contractJson = JSON.parse(fs.readFileSync('./build/contracts/' + UniswapPoolRewards.contractName + '.json', 'utf8'));
    console.log('Saving ABI:', './abis/' + network + '/' + UniswapPoolRewards.contractName + '.json.abi');
    fs.writeFileSync('./abis/' + network + '/' + UniswapPoolRewards.contractName + '.json.abi', JSON.stringify(contractJson.abi));
  }

  if (network == 'ganache') {
    const elimuToken = '0x0000000000000000000000000000000000000000';
    console.log('elimuToken:', elimuToken);
    const poolToken = '0x0000000000000000000000000000000000000000';
    console.log('poolToken:', poolToken);
    deployer.deploy(UniswapPoolRewards, elimuToken, poolToken);
  } else if (network == 'rinkeby') {
    const elimuToken = '0xe29797910d413281d2821d5d9a989262c8121cc2';
    console.log('elimuToken:', elimuToken);
    const poolToken = '0x9936bdcd16e8c709c4cb8d7b871f0011b4cc65de';
    console.log('poolToken:', poolToken);
    deployer.deploy(UniswapPoolRewards, elimuToken, poolToken);
  }
};
