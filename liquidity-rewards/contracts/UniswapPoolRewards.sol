// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./dependencies/PoolTokenWrapper.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract UniswapPoolRewards is PoolTokenWrapper, Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 public elimuToken;

    /**
     * @dev We can set a reward rate per Ethereum block. 
     * Right now the average time per block is ~15 seconds, 
     * which is:
     * 4 blocks per minute = 0.0666... blocks/second
     * 240 blocks per hour (60 minutes)
     * 5,760 blocks per day (24 hours)
     * 172,800 blocks per month (30 days)
     * So we can use this to calculate a reward rate of 322,500 $ELIMU / 172,800 blocks/month = 1.87 $ELIMU/block 
     * => rewardRate = 1.87 ($ELIMU/block ) X 0.06666... (blocks/second) x 10e18 (token decimals) = 124666666666666666
     */
    uint256 public rewardRate = 124666666666666666;
    
    /**
     * @dev Take track of last time the amount of deposited pool token changed to 
     */
    uint256 public lastUpdateTime;
    /** 
     * @dev rewardPerTokenStored is used to find the actual reward distribution 
     * according to rewardRate and the amount of pool token deposited on the contract.
     */
    uint256 public rewardPerTokenDeposited;
    
    mapping(address => uint256) public userRewardPerTokenClaimed;
    /** 
     * @dev We save pending account rewards whenever rewardPerTokenDeposited is updated.
     */
    mapping(address => uint256) public rewards;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);

    constructor(address _elimuTokenAddress, address _poolTokenAddress) {
        poolToken = IERC20(_poolTokenAddress);
        elimuToken = IERC20(_elimuTokenAddress);
    }

    /** 
     * @dev Deposit the reward token and update the reward.
     */
    function depositReward(uint256 reward) external onlyOwner {
        assert(reward > 0);
        elimuToken.transferFrom(msg.sender, address(this), reward);
        
        _updateReward();
    }

    /** 
     * @dev Return the current reward amount.
     */
    function rewardBalance() public view returns (uint256)  {
        return elimuToken.balanceOf(address(this));
    }

    /** 
     * @dev Returns the amount of rewards that correspond to each deposited token.
     */
    function rewardPerToken() public view returns (uint256) {
        if (totalSupply() == 0) {
            return rewardPerTokenDeposited;
        }
        return
            rewardPerTokenDeposited.add(
                block.timestamp
                    .sub(lastUpdateTime)
                    .mul(rewardRate)
                    .mul(1e18)
                    .div(totalSupply())
            );
    }

    /**
     *  @dev Returns the amount that an account can claim.
     */
    function rewardsEarned(address account) public view returns (uint256) {
        return
            balanceOf(account)
                .mul(rewardPerToken().sub(userRewardPerTokenClaimed[account]))
                .div(1e18)
                .add(rewards[account]);
    }

    /** 
     * @dev deposit visibility is public as overriding poolTokenWrapper's deposit() function.
     */
    function deposit(uint256 amount) public override {
        require(amount > 0, "Cannot stake 0");
        require(address(poolToken) != address(0), "Liquidity Pool Token has not been set yet");

        _updateAccountReward(msg.sender);

        super.deposit(amount);
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) public override{
        require(amount > 0, "Cannot withdraw 0");
        require(address(poolToken) != address(0), "Liquidity Pool Token has not been set yet");

        _updateAccountReward(msg.sender);

        super.withdraw(amount);
        emit Withdrawn(msg.sender, amount);
    }
    
    /** 
     * @dev Shortcut to be able to withdraw tokens and claim rewards in one transaction.
     */
    function withdrawAndClaim() external {
        withdraw(balanceOf(msg.sender));
        claimReward();
    }

    function claimReward() public {
        require(address(poolToken) != address(0), "Liquidity Pool Token has not been set yet");

        _updateAccountReward(msg.sender);

        uint256 reward = rewardsEarned(msg.sender);

        require(reward > 0, "Nothing to claim");

        elimuToken.transfer(msg.sender, reward);
        rewards[msg.sender] = 0;
        emit RewardClaimed(msg.sender, reward);
    }

    /** 
     * @dev Returns the amount of rewards that correspond to each deposited token.
     */
    function _updateReward() internal {
        rewardPerTokenDeposited = rewardPerToken();
        lastUpdateTime = block.timestamp;
    }


    /** 
     * @dev Update the user pending reward and rewardPerTokenDeposited whenever 
     * totalPoolTokenSupply() is changed because of a user deposit/withdrawal
     * of the pool tokens.
     */
    function _updateAccountReward(address account) internal {
        _updateReward();

        assert(account != address(0));

        rewards[account] = rewardsEarned(account);
        userRewardPerTokenClaimed[account] = rewardPerTokenDeposited;
    }
}
