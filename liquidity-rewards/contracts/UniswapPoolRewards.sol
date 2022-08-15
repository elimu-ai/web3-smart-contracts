// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "./IPoolRewards.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract UniswapPoolRewards is IPoolRewards, AccessControl {
    using SafeERC20 for IERC20;

    /**
     * `$ELIMU` ERC20 token interface.
     */
    IERC20 public elimuToken;

    /**
     * Pool token ERC20 token interface.
     */
    IERC20 public poolToken;

    /**
     * User balances of the pool token.
     */
    mapping(address => uint256) private _balances;

    /**
     * The elimuToken reward emission rate per second.
     */
    uint256 public rewardRatePerSecond = 0.125 * 1e18;

    /**
     * Keeps track of last time the amount of deposited pool tokens changed.
     */
    uint256 public lastUpdateTime;

    /**
     * rewardPerTokenDeposited is used to find the actual reward distribution
     * according to rewardRatePerSecond and the amount of pool token deposited on the contract.
     */
    uint256 public rewardPerTokenDeposited;


    /**
     * userRewardPerTokenClaimed is used to indicate the value of affected reward distribution
     * when an account claimed his/her rewards previously.
     */
    mapping(address => uint256) public userRewardPerTokenClaimed;

    /**
     * Pending account rewards are saved whenever rewardPerTokenDeposited is updated.
     */
    mapping(address => uint256) public rewards;

    event PoolTokensDeposited(address indexed user, uint256 amount);
    event PoolTokensWithdrawn(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);

    /**
     * Required inputs while deploying this contract:
     * elimuToken_: $ELIMU token address 
     * poolToken_: Liquidity pool token address
     */
    constructor(address elimuToken_, address poolToken_) {
        elimuToken = IERC20(elimuToken_);
        poolToken = IERC20(poolToken_);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function poolTokenBalance(address account) public view returns (uint256) {
        return _balances[account];
    }

    function setRewardRatePerSecond(uint256 rewardRatePerSecond_) public onlyRole(DEFAULT_ADMIN_ROLE) {
        // End the reward program if the rewardRatePerSecond variable is set to the 0 value.
        _updateReward();
        rewardRatePerSecond = rewardRatePerSecond_;
    }

    /**
     * Returns the amount of rewards that correspond to each deposited token.
     */
    function rewardPerToken() public view returns (uint256) {
        uint256 poolTokenBalance = poolToken.balanceOf(address(this));
        if (poolTokenBalance == 0) {
            return rewardPerTokenDeposited;
        }
        return rewardPerTokenDeposited + ((block.timestamp - lastUpdateTime) * rewardRatePerSecond * 1e18) / poolTokenBalance;
    }

    /**
     * Returns the reward amount that an account can claim.
     */
    function claimableReward(address account) public view returns (uint256) {
        uint256 poolTokenBalance = poolTokenBalance(account);
        return rewards[account] + (poolTokenBalance * (rewardPerToken() - userRewardPerTokenClaimed[account])) / 1e18;
    }

    /**
     * Deposit pool tokens into this contract and start earning rewards.
     */
    function depositPoolTokens(uint256 amount) public {
        require(amount > 0, "Cannot deposit 0");

        _updateAccountReward(msg.sender);

        _balances[msg.sender] = _balances[msg.sender] + amount;
        poolToken.safeTransferFrom(msg.sender, address(this), amount);

        emit PoolTokensDeposited(msg.sender, amount);
    }

    /**
     * Withdraw previously deposited pool tokens from this contract.
     */
    function withdrawPoolTokens(uint256 amount) public {
        require(amount > 0, "Cannot withdraw 0");

        _updateAccountReward(msg.sender);

        _balances[msg.sender] = _balances[msg.sender] - amount;
        poolToken.safeTransfer(msg.sender, amount);

        emit PoolTokensWithdrawn(msg.sender, amount);
    }

    /**
     * Claim remaining earned rewards if there is any.
     */
    function claimReward() public {
        _updateAccountReward(msg.sender);

        uint256 reward = claimableReward(msg.sender);

        require(reward > 0, "Nothing to claim");

        elimuToken.transfer(msg.sender, reward);
        rewards[msg.sender] = 0;
        emit RewardClaimed(msg.sender, reward);
    }

    /**
     * Shortcut to be able to withdraw tokens and claim rewards in one transaction.
     */
    function withdrawPoolTokensAndClaimReward() public {
        uint256 poolTokenBalance = poolTokenBalance(msg.sender);
        withdrawPoolTokens(poolTokenBalance);
        claimReward();
    }

    /**
     * Returns the amount of rewards that correspond to each deposited token.
     */
    function _updateReward() internal {
        rewardPerTokenDeposited = rewardPerToken();
        lastUpdateTime = block.timestamp;
    }

    /**
     * Update the user pending reward and rewardPerTokenDeposited whenever
     * the pool token balance is changed because of a user depositPoolTokens/withdrawPoolTokens
     * of the pool tokens.
     */
    function _updateAccountReward(address account) internal {
        _updateReward();
        rewards[account] = claimableReward(account);
        userRewardPerTokenClaimed[account] = rewardPerTokenDeposited;
    }
}
