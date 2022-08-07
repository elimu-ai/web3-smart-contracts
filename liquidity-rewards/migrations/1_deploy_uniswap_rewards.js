const UniswapPoolRewards = artifacts.require("UniswapPoolRewards");
const ElimuTokenMock = artifacts.require("ERC20Mock");
const PoolTokenMock = artifacts.require("ERC20Mock");
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

  if ((network == 'test') || (network == 'soliditycoverage')) {
    // const elimuTokenContract = deployer.deploy(ElimuTokenMock, 'elimu.ai', 'ELIMU', deployer.options.from, 38_700_000);
    // console.log('elimuTokenContract.address:', elimuTokenContract.address);
    // const poolTokenContract = deployer.deploy(PoolTokenMock, 'Uniswap V2', 'UNI-V2', deployer.options.from, 1_000);
    // console.log('poolTokenContract.address:', poolTokenContract.address);
    // deployer.deploy(UniswapPoolRewards, elimuTokenContract.address, poolTokenContract.address);
    const elimuTokenAddress = '0x1111111111111111111111111111111111111111';
    console.log('elimuTokenAddress:', elimuTokenAddress);
    const poolTokenAddress = '0x2222222222222222222222222222222222222222';
    console.log('poolTokenAddress:', poolTokenAddress);
    deployer.deploy(UniswapPoolRewards, elimuTokenAddress, poolTokenAddress);
  } else if (network == 'ganache') {
    const elimuTokenAddress = '0x1111111111111111111111111111111111111111';
    console.log('elimuTokenAddress:', elimuTokenAddress);
    const poolTokenAddress = '0x2222222222222222222222222222222222222222';
    console.log('poolTokenAddress:', poolTokenAddress);
    deployer.deploy(UniswapPoolRewards, elimuTokenAddress, poolTokenAddress);
  } else if (network == 'rinkeby') {
    const elimuTokenAddress = '0xe29797910d413281d2821d5d9a989262c8121cc2';
    console.log('elimuTokenAddress:', elimuTokenAddress);
    const poolTokenAddress = '0x9936bdcd16e8c709c4cb8d7b871f0011b4cc65de';
    console.log('poolTokenAddress:', poolTokenAddress);
    deployer.deploy(UniswapPoolRewards, elimuTokenAddress, poolTokenAddress);
  }
};
