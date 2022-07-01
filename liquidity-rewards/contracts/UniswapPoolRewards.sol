// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Dependencies/LPTokenWrapper.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";


contract UniswapPoolRewards is LPTokenWrapper, Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 public elimuToken;


    /* we can set a rewardRate per Ethereum block. Right now the average time per block is ~15 seconds, which is:
     * 4 blocks per minute
     * 240 blocks per hour (60 minutes)
     * 5,760 blocks per day (24 hours)
     * 172,800 blocks per month (30 days)
     * So we can use this to calculate a reward rate of 322,500 $ELIMU / 172,800 blocks/month = 1.87 $ELIMU/block 
     * => rewardRate = 1.87 x 10e18 (token decimals) = 1870000000000000000
     */
    uint256 public rewardRate = 1870000000000000000;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);

    constructor(address _elimuTokenAddress, address _lpTokenAddress) {
        lpToken = IERC20(_lpTokenAddress);
        elimuToken = IERC20(_elimuTokenAddress);
    }


    // Returns the amount of rewards that correspond to each staked token
    function rewardPerToken() public view returns (uint256) {
        if (totalSupply() == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored.add(
                block.timestamp
                    .sub(lastUpdateTime)
                    .mul(rewardRate)
                    .mul(1e18)
                    .div(totalSupply())
            );
    }

    // Returns the amount that an account can claim
    function rewardsEarned(address account) public view returns (uint256) {
        return
            balanceOf(account)
                .mul(rewardPerToken().sub(userRewardPerTokenPaid[account]))
                .div(1e18)
                .add(rewards[account]);
    }

    // deposit visibility is public as overriding LPTokenWrapper's deposit() function
    function deposit(uint256 amount) public override {
        require(amount > 0, "Cannot stake 0");
        require(address(lpToken) != address(0), "Liquidity Pool Token has not been set yet");

        _updateAccountReward(msg.sender);

        super.deposit(amount);
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) public override{
        require(amount > 0, "Cannot withdraw 0");
        require(address(lpToken) != address(0), "Liquidity Pool Token has not been set yet");

        _updateAccountReward(msg.sender);

        super.withdraw(amount);
        emit Withdrawn(msg.sender, amount);
    }

    // Shortcut to be able to unstake tokens and claim rewards in one transaction
    function withdrawAndClaim() external {
        withdraw(balanceOf(msg.sender));
        claimReward();
    }

    function claimReward() public {
        require(address(lpToken) != address(0), "Liquidity Pool Token has not been set yet");

        _updateAccountReward(msg.sender);

        uint256 reward = rewardsEarned(msg.sender);

        require(reward > 0, "Nothing to claim");

        rewards[msg.sender] = 0;
        elimuToken.transfer(msg.sender, reward);
        emit RewardClaimed(msg.sender, reward);
    }

    function depositReward(uint256 reward) external onlyOwner {
        assert(reward > 0);
        elimuToken.transferFrom(msg.sender, address(this), reward);
        
        uint256 totalReward = elimuToken.balanceOf(address(this));
        _updateReward();

        lastUpdateTime = block.timestamp;
    }

    function _updateReward() internal {
        rewardPerTokenStored = rewardPerToken();
    }

    function _updateAccountReward(address account) internal {
        _updateReward();

        assert(account != address(0));

        rewards[account] = rewardsEarned(account);
        userRewardPerTokenPaid[account] = rewardPerTokenStored;
    }
}