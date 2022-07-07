const UniswapPoolRewards = artifacts.require("UniswapPoolRewards");
const SushiswapPoolRewards = artifacts.require("SushiswapPoolRewards");
const BalancerPoolRewards = artifacts.require("BalancerPoolRewards");

module.exports = function (deployer) {
  var ELIMUTokenAddress = process.env.ELIMU_TOKEN_ADDRESS;
  var UniswapTokenAddress = process.env.UNISWAP_LP_TOKEN_ADDRESS;
  var SushiswapTokenAddress = process.env.SUSHISWAP_LP_TOKEN_ADDRESS;
  var BalancerTokenAddress = process.env.BALANCER_LP_TOKEN_ADDRESS;
  deployer.deploy(UniswapPoolRewards, ELIMUTokenAddress, UniswapTokenAddress);
  deployer.deploy(SushiswapPoolRewards, ELIMUTokenAddress, SushiswapTokenAddress);
  deployer.deploy(BalancerPoolRewards, ELIMUTokenAddress, BalancerTokenAddress);
};
