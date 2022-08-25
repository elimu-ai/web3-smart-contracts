const UniswapPoolRewards = artifacts.require("UniswapPoolRewards");
const RewardTokenMock = artifacts.require("ERC20Mock");
const PoolTokenMock = artifacts.require("ERC20Mock");
const fs = require('fs');

module.exports = function (deployer, network, accounts) {
  console.log('deployer.options.from:', deployer.options.from);
  console.log('network:', network);
  console.log('accounts:', accounts);

  const isDryRun = network.endsWith('-fork') || network.endsWith('coverage');
  if (!isDryRun) {
    // Save the contract's ABI
    const contractJson = JSON.parse(fs.readFileSync('./build/contracts/' + UniswapPoolRewards.contractName + '.json', 'utf8'));
    console.log('Saving ABI:', './abis/' + network + '/' + UniswapPoolRewards.contractName + '.json.abi');
    fs.writeFileSync('./abis/' + network + '/' + UniswapPoolRewards.contractName + '.json.abi', JSON.stringify(contractJson.abi));
  }

  if ((network == 'test') || (network == 'soliditycoverage')) {
    deployer.then(async function() {
      await deployer.deploy(RewardTokenMock, 'elimu.ai', 'ELIMU', deployer.options.from, web3.utils.toWei('38700000')); // 38,700,000
      const rewardTokenContract = await RewardTokenMock.deployed();
      console.log('rewardTokenContract.address:', rewardTokenContract.address);
      await deployer.deploy(PoolTokenMock, 'Uniswap V2', 'UNI-V2', deployer.options.from, web3.utils.toWei('1000')); // 1,000
      const poolTokenContract = await PoolTokenMock.deployed();
      console.log('poolTokenContract.address:', poolTokenContract.address);
      await deployer.deploy(UniswapPoolRewards, rewardTokenContract.address, poolTokenContract.address);
    });
  } else if (network == 'ganache') {
    const rewardTokenAddress = '0x1111111111111111111111111111111111111111';
    console.log('rewardTokenAddress:', rewardTokenAddress);
    const poolTokenAddress = '0x2222222222222222222222222222222222222222';
    console.log('poolTokenAddress:', poolTokenAddress);
    deployer.deploy(UniswapPoolRewards, rewardTokenAddress, poolTokenAddress);
  } else if (network == 'rinkeby') {
    const rewardTokenAddress = '0xe29797910d413281d2821d5d9a989262c8121cc2';
    console.log('rewardTokenAddress:', rewardTokenAddress);
    const poolTokenAddress = '0x9936bdcd16e8c709c4cb8d7b871f0011b4cc65de';
    console.log('poolTokenAddress:', poolTokenAddress);
    deployer.deploy(UniswapPoolRewards, rewardTokenAddress, poolTokenAddress);
  }
};
