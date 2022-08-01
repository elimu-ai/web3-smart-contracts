// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "truffle/Assert.sol";
import "../contracts/UniswapPoolRewards.sol";
import "../contracts/mocks/ERC20Mock.sol";

contract UniswapPoolRewardsTest {

    UniswapPoolRewards private uniswapPoolRewards;

    function setup() public {
        ERC20Mock elimuToken = new ERC20Mock("Uniswap V2", "UNI-V2", msg.sender, 0);
        ERC20Mock poolToken = new ERC20Mock("elimu.ai", "ELIMU", msg.sender, 0);
        uniswapPoolRewards = new UniswapPoolRewards(address(elimuToken), address(poolToken));
    }

    function testSetRewardRatePerSecond() public {
        // uint256 actual = uniswapPoolRewards.rewardRatePerSecond();
        // uint256 expected = 0.125 * 1e18;
        // Assert.equal(actual, expected, "Reward rate should be 0.125");
        
        // TODO
    }
}
