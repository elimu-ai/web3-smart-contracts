const UniswapPoolRewards = artifacts.require("UniswapPoolRewards");
const fs = require('fs');

module.exports = function (deployer, network) {
  console.log('network:', network);

  let isDryRun = network.endsWith('-fork') || network.endsWith('coverage');
  if (!isDryRun) {
    // Save the contract's ABI
    const contractJson = JSON.parse(fs.readFileSync('./build/contracts/' + UniswapPoolRewards.contractName + '.json', 'utf8'));
    console.log('Saving ABI:', './abis/' + network + '/' + UniswapPoolRewards.contractName + '.json.abi');
    fs.writeFileSync('./abis/' + network + '/' + UniswapPoolRewards.contractName + '.json.abi', JSON.stringify(contractJson.abi));
  }

  var ELIMUTokenAddress = process.env.ELIMU_TOKEN_ADDRESS || '0xe29797910d413281d2821d5d9a989262c8121cc2';
  var UniswapTokenAddress = process.env.UNISWAP_LP_TOKEN_ADDRESS || '0xa0d230dca71a813c68c278ef45a7dac0e584ee61';
  deployer.deploy(UniswapPoolRewards, ELIMUTokenAddress, UniswapTokenAddress);
};
