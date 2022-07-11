const UniswapPoolRewards = artifacts.require("UniswapPoolRewards");

module.exports = function (deployer) {
  var ELIMUTokenAddress = process.env.ELIMU_TOKEN_ADDRESS || '0xe29797910d413281d2821d5d9a989262c8121cc2';
  var UniswapTokenAddress = process.env.UNISWAP_LP_TOKEN_ADDRESS || '0xa0d230dca71a813c68c278ef45a7dac0e584ee61';
  deployer.deploy(UniswapPoolRewards, ELIMUTokenAddress, UniswapTokenAddress);
};
