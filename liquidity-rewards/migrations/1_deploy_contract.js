const UniswapPoolRewards = artifacts.require("UniswapPoolRewards");

module.exports = function (deployer) {
  var ELIMUTokenAddress = process.env.ELIMU_TOKEN_ADDRESS;
  var UniswapTokenAddress = process.env.UNISWAP_LP_TOKEN_ADDRESS;
  deployer.deploy(UniswapPoolRewards, ELIMUTokenAddress, UniswapTokenAddress);
};
