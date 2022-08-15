// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "./IPoolRewards.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract UniswapPoolRewards is IPoolRewards, AccessControl {
    using SafeERC20 for IERC20;

    IERC20 public elimuToken;

    IERC20 public poolToken;

    mapping(address => uint256) private _poolTokenBalances;

    /**
     * The `elimuToken` reward emission rate per second.
     */
    uint256 public rewardRatePerSecond = 0.125 * 1e18;

    uint256 public lastUpdateTime;

    uint256 public rewardPerTokenDeposited;

    mapping(address => uint256) public userRewardPerTokenClaimed;

    mapping(address => uint256) public rewards;

    event PoolTokensDeposited(address indexed user, uint256 amount);
    event PoolTokensWithdrawn(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);

    constructor(address elimuToken_, address poolToken_) {
        elimuToken = IERC20(elimuToken_);
        poolToken = IERC20(poolToken_);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function poolTokenBalance(address account) public view returns (uint256) {
        return _poolTokenBalances[account];
    }

    function setRewardRatePerSecond(uint256 rewardRatePerSecond_) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _updateReward();
        rewardRatePerSecond = rewardRatePerSecond_;
    }

    function rewardPerToken() public view returns (uint256) {
        uint256 poolTokenBalance = poolToken.balanceOf(address(this));
        if (poolTokenBalance == 0) {
            return rewardPerTokenDeposited;
        }
        return rewardPerTokenDeposited + ((block.timestamp - lastUpdateTime) * rewardRatePerSecond * 1e18) / poolTokenBalance;
    }

    function claimableReward(address account) public view returns (uint256) {
        uint256 poolTokenBalance = poolTokenBalance(account);
        return rewards[account] + (poolTokenBalance * (rewardPerToken() - userRewardPerTokenClaimed[account])) / 1e18;
    }

    function depositPoolTokens(uint256 amount) public {
        require(amount > 0, "Cannot deposit 0");

        _updateAccountReward(msg.sender);

        _poolTokenBalances[msg.sender] = _poolTokenBalances[msg.sender] + amount;
        poolToken.safeTransferFrom(msg.sender, address(this), amount);

        emit PoolTokensDeposited(msg.sender, amount);
    }

    function withdrawPoolTokens(uint256 amount) public {
        require(amount > 0, "Cannot withdraw 0");

        _updateAccountReward(msg.sender);

        _poolTokenBalances[msg.sender] = _poolTokenBalances[msg.sender] - amount;
        poolToken.safeTransfer(msg.sender, amount);

        emit PoolTokensWithdrawn(msg.sender, amount);
    }

    function claimReward() public {
        _updateAccountReward(msg.sender);

        uint256 reward = claimableReward(msg.sender);

        require(reward > 0, "Nothing to claim");

        elimuToken.transfer(msg.sender, reward);
        rewards[msg.sender] = 0;
        emit RewardClaimed(msg.sender, reward);
    }

    function withdrawPoolTokensAndClaimReward() public {
        uint256 poolTokenBalance = poolTokenBalance(msg.sender);
        withdrawPoolTokens(poolTokenBalance);
        claimReward();
    }

    function _updateReward() internal {
        rewardPerTokenDeposited = rewardPerToken();
        lastUpdateTime = block.timestamp;
    }

    function _updateAccountReward(address account) internal {
        _updateReward();
        rewards[account] = claimableReward(account);
        userRewardPerTokenClaimed[account] = rewardPerTokenDeposited;
    }
}
