// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "./IPoolRewards.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract UniswapPoolRewards is IPoolRewards, AccessControl {
    using SafeERC20 for IERC20;

    IERC20 public elimuToken;
    IERC20 public poolToken;

    uint256 public rewardRatePerSecond = 0.125 * 1e18;
    uint256 public lastRewardPerPoolToken;
    uint256 public lastUpdateTimestamp;

    mapping(address => uint256) public poolTokenBalances;
    mapping(address => uint256) public rewardBalances;
    mapping(address => uint256) public rewardPerPoolTokenClaimed;

    event PoolTokensDeposited(address indexed account, uint256 amount);
    event PoolTokensWithdrawn(address indexed account, uint256 amount);
    event RewardClaimed(address indexed account, uint256 amount);

    constructor(address elimuToken_, address poolToken_) {
        elimuToken = IERC20(elimuToken_);
        poolToken = IERC20(poolToken_);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function setRewardRatePerSecond(uint256 rewardRatePerSecond_) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _updateLastRewardPerPoolToken();
        rewardRatePerSecond = rewardRatePerSecond_;
    }

    function rewardPerPoolToken() public view returns (uint256) {
        uint256 poolTokenBalance = poolToken.balanceOf(address(this));
        if (poolTokenBalance == 0) {
            return lastRewardPerPoolToken;
        }
        uint256 timePassedSinceLastUpdate = block.timestamp - lastUpdateTimestamp;
        uint256 rewardEarnedSinceLastUpdate = timePassedSinceLastUpdate * rewardRatePerSecond * 1e18;
        uint256 rewardPerPoolTokenSinceLastUpdate = rewardEarnedSinceLastUpdate / poolTokenBalance;
        return lastRewardPerPoolToken + rewardPerPoolTokenSinceLastUpdate;
    }

    function claimableReward(address account) public view returns (uint256) {
        uint256 poolTokenBalance = poolTokenBalances[account];
        uint256 rewardPerPoolTokenClaimedSinceLastUpdate = rewardPerPoolTokenClaimed[account];
        uint256 rewardPerPoolTokenSinceLastUpdate = rewardPerPoolToken() - rewardPerPoolTokenClaimedSinceLastUpdate;
        uint256 rewardEarnedSinceLastUpdate = poolTokenBalance * rewardPerPoolTokenSinceLastUpdate / 1e18;
        return rewardBalances[account] + rewardEarnedSinceLastUpdate;
    }

    function depositPoolTokens(uint256 amount) public {
        require(amount > 0, "Cannot deposit 0");

        _updateRewardBalances();

        poolTokenBalances[msg.sender] = poolTokenBalances[msg.sender] + amount;
        poolToken.safeTransferFrom(msg.sender, address(this), amount);

        emit PoolTokensDeposited(msg.sender, amount);
    }

    function withdrawPoolTokens() public {
        uint256 poolTokenBalance = poolTokenBalances[msg.sender];
        require(poolTokenBalance > 0, "Cannot withdraw 0");

        _updateRewardBalances();

        poolTokenBalances[msg.sender] = 0;
        poolToken.safeTransfer(msg.sender, poolTokenBalance);

        emit PoolTokensWithdrawn(msg.sender, poolTokenBalance);
    }

    function claimReward() public {
        _updateRewardBalances();

        uint256 reward = claimableReward(msg.sender);

        require(reward > 0, "Nothing to claim");

        elimuToken.transfer(msg.sender, reward);
        rewardBalances[msg.sender] = 0;
        emit RewardClaimed(msg.sender, reward);
    }

    function withdrawPoolTokensAndClaimReward() public {
        withdrawPoolTokens();
        claimReward();
    }

    function _updateLastRewardPerPoolToken() internal {
        lastRewardPerPoolToken = rewardPerPoolToken();
        lastUpdateTimestamp = block.timestamp;
    }

    function _updateRewardBalances() internal {
        _updateLastRewardPerPoolToken();
        rewardBalances[msg.sender] = claimableReward(msg.sender);
        rewardPerPoolTokenClaimed[msg.sender] = lastRewardPerPoolToken;
    }
}
