// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "./dependencies/PoolTokenWrapper.sol";

contract UniswapPoolRewards is PoolTokenWrapper {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /**
     * `$ELIMU` ERC20 token interface.
     */
    IERC20 public elimuToken;

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
    }

    /**
     * Return the current reward amount.
     */
    function rewardBalance() public view returns (uint256) {
        return elimuToken.balanceOf(address(this));
    }

    /**
     * Returns the amount of rewards that correspond to each deposited token.
     */
    function rewardPerToken() public view returns (uint256) {
        if (totalSupply() == 0) {
            return rewardPerTokenDeposited;
        }
        return
            rewardPerTokenDeposited.add(
                block
                    .timestamp
                    .sub(lastUpdateTime)
                    .mul(rewardRatePerSecond)
                    .mul(1e18)
                    .div(totalSupply())
            );
    }

    /**
     * Returns the reward amount that an account can claim.
     */
    function rewardsEarned(address account) public view returns (uint256) {
        return
            balanceOf(account)
                .mul(rewardPerToken().sub(userRewardPerTokenClaimed[account]))
                .div(1e18)
                .add(rewards[account]);
    }

    /**
     * Deposit pool tokens into this contract and start earning rewards.
     */
    function depositPoolTokens(uint256 amount) public override {
        require(amount > 0, "Cannot deposit 0");

        _updateAccountReward(msg.sender);

        super.depositPoolTokens(amount);
        emit PoolTokensDeposited(msg.sender, amount);
    }

    /**
     * Withdraw previously deposited pool tokens from this contract.
     */
    function withdrawPoolTokens(uint256 amount) public override {
        require(amount > 0, "Cannot withdraw 0");

        _updateAccountReward(msg.sender);

        super.withdrawPoolTokens(amount);
        emit PoolTokensWithdrawn(msg.sender, amount);
    }

    /**
     * Shortcut to be able to withdraw tokens and claim rewards in one transaction.
     */
    function withdrawPoolTokensAndClaim() external {
        withdrawPoolTokens(balanceOf(msg.sender));
        claimReward();
    }

    /**
     * Claim remaining earned rewards if there is any.
     */
    function claimReward() public {
        _updateAccountReward(msg.sender);

        uint256 reward = rewardsEarned(msg.sender);

        require(reward > 0, "Nothing to claim");

        elimuToken.transfer(msg.sender, reward);
        rewards[msg.sender] = 0;
        emit RewardClaimed(msg.sender, reward);
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
     * totalPoolTokenSupply() is changed because of a user depositPoolTokens/withdrawPoolTokens
     * of the pool tokens.
     */
    function _updateAccountReward(address account) internal {
        _updateReward();

        assert(account != address(0));

        rewards[account] = rewardsEarned(account);
        userRewardPerTokenClaimed[account] = rewardPerTokenDeposited;
    }
}
