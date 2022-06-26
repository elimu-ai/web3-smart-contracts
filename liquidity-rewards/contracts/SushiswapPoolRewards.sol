// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Dependencies/LPTokenWrapper.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";


contract SushiswapPoolRewards is LPTokenWrapper, Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    string constant public NAME = "SushiswapPoolRewards";

    IERC20 public elimuToken;

    uint256 public duration;
    uint256 public periodFinish = 0;
    uint256 public rewardPeriod = 0;

    uint256 public rewardRate = 0;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    uint256 public totalRewardPaid = 0;
    uint256 public periodRewardPaid = 0;
    uint256 public periodTotalStaked = 0;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    event ELIMUTokenAddressChanged(address _elimuTokenAddress);
    event LPTokenAddressChanged(address _lpTokenAddress);
    event Staked(address indexed user, uint256 period, uint256 amount);
    event Withdrawn(address indexed user, uint256 period,  uint256 amount);
    event RewardPaid(address indexed user, uint256 period, uint256 reward);
    event RewardPeriodStarted(uint256 period, uint256 reward, uint duration);
    event RewardPeriodFinished(uint256 period, uint256 totalStaked, uint256 periodRewardsPaid, uint256 rewardRate, uint256 rewardPerTokenStored);

    constructor(address _elimuTokenAddress, address _lpTokenAddress) {
        lpToken = IERC20(_lpTokenAddress);
        elimuToken = IERC20(_elimuTokenAddress);

        emit ELIMUTokenAddressChanged(_elimuTokenAddress);
        emit LPTokenAddressChanged(_lpTokenAddress);

    }

    function startRewardPeriod(
        uint256 reward,
        uint256 durationSeconds
    )
        external
        onlyOwner
    {
        rewardPeriod = rewardPeriod.add(1);
        if (rewardPeriod > 1) {
            emit RewardPeriodFinished(rewardPeriod.sub(1), periodTotalStaked, periodRewardPaid, rewardRate, rewardPerTokenStored);
            periodRewardPaid = 0;
            periodTotalStaked = 0;
        }
        duration = durationSeconds;
        _notifyRewardAmount(reward, duration);
        emit RewardPeriodStarted(rewardPeriod, reward, duration);
    }

    // Returns current timestamp if the rewards program has not finished yet, end time otherwise
    function lastTimeRewardApplicable() public view returns (uint256) {
        return Math.min(block.timestamp, periodFinish);
    }

    // Returns the amount of rewards that correspond to each staked token
    function rewardPerToken() public view returns (uint256) {
        if (totalSupply() == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored.add(
                lastTimeRewardApplicable()
                    .sub(lastUpdateTime)
                    .mul(rewardRate)
                    .mul(1e18)
                    .div(totalSupply())
            );
    }

    // Returns the amount that an account can claim
    function earned(address account) public view returns (uint256) {
        return
            balanceOf(account)
                .mul(rewardPerToken().sub(userRewardPerTokenPaid[account]))
                .div(1e18)
                .add(rewards[account]);
    }

    // stake visibility is public as overriding LPTokenWrapper's stake() function
    function stake(uint256 amount) public override {
        require(amount > 0, "Cannot stake 0");
        require(address(lpToken) != address(0), "Liquidity Pool Token has not been set yet");

        _updatePeriodFinish();
        _updateAccountReward(msg.sender);

        super.stake(amount);
        periodTotalStaked = periodTotalStaked.add(amount);
        emit Staked(msg.sender, rewardPeriod, amount);
    }

    function withdraw(uint256 amount) public override{
        require(amount > 0, "Cannot withdraw 0");
        require(address(lpToken) != address(0), "Liquidity Pool Token has not been set yet");

        _updateAccountReward(msg.sender);

        super.withdraw(amount);
        periodTotalStaked = periodTotalStaked.sub(amount);
        emit Withdrawn(msg.sender, rewardPeriod, amount);
    }

    // Shortcut to be able to unstake tokens and claim rewards in one transaction
    function withdrawAndClaim() external {
        withdraw(balanceOf(msg.sender));
        claimReward();
    }

    function claimReward() public {
        require(address(lpToken) != address(0), "Liquidity Pool Token has not been set yet");

        _updatePeriodFinish();
        _updateAccountReward(msg.sender);

        uint256 reward = earned(msg.sender);

        require(reward > 0, "Nothing to claim");

        rewards[msg.sender] = 0;
        totalRewardPaid = totalRewardPaid.add(reward);
        periodRewardPaid = periodRewardPaid.add(reward);
        elimuToken.transfer(msg.sender, reward);
        emit RewardPaid(msg.sender, rewardPeriod, reward);
    }


    function _notifyRewardAmount(uint256 _reward, uint256 _duration) internal {
        assert(_reward > 0);
        elimuToken.transferFrom(msg.sender, address(this), _reward);
        
        uint256 totalReward = elimuToken.balanceOf(address(this));
        _updateReward();

        rewardRate = totalReward.div(_duration);

        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp.add(_duration);
    }

    // Adjusts end time for the program after periods of zero total supply
    function _updatePeriodFinish() internal {
        if (totalSupply() == 0) {
            assert(periodFinish > 0);
            /*
             * If the finish period has been reached (but there are remaining rewards due to zero stake),
             * to get the new finish date we must add to the current timestamp the difference between
             * the original finish time and the last update, i.e.:
             *
             * periodFinish = block.timestamp.add(periodFinish.sub(lastUpdateTime));
             *
             * If we have not reached the end yet, we must extend it by adding to it the difference between
             * the current timestamp and the last update (the period where the supply has been empty), i.e.:
             *
             * periodFinish = periodFinish.add(block.timestamp.sub(lastUpdateTime));
             *
             * Both formulas are equivalent.
             */
            periodFinish = periodFinish.add(block.timestamp.sub(lastUpdateTime));
        }
    }

    function _updateReward() internal {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();
    }

    function _updateAccountReward(address account) internal {
        _updateReward();

        assert(account != address(0));

        rewards[account] = earned(account);
        userRewardPerTokenPaid[account] = rewardPerTokenStored;
    }
}