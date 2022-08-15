const UniswapPoolRewards = artifacts.require("UniswapPoolRewards")
const ElimuTokenMock = artifacts.require("ERC20Mock")
const PoolTokenMock = artifacts.require("ERC20Mock")
const { time } = require('@openzeppelin/test-helpers')

contract("UniswapPoolRewards", (accounts) => {

    beforeEach(async () => {
        console.log('\n🔁 beforeEach()')
        
        if (this.rewardsContract) {
            // Print the current state of the contract's variables

            const poolTokenBalance = await this.poolTokenContract.balanceOf(this.rewardsContract.address)
            console.log(' ├── poolTokenBalance:', web3.utils.fromWei(poolTokenBalance))

            const rewardRatePerSecond = await this.rewardsContract.rewardRatePerSecond()
            console.log(' ├── rewardRatePerSecond():', web3.utils.fromWei(rewardRatePerSecond))

            const lastUpdateTimestamp = await this.rewardsContract.lastUpdateTimestamp()
            console.log(' ├── lastUpdateTimestamp.toNumber():', lastUpdateTimestamp.toNumber())
            const lastUpdateTimestampAsDate = new Date(lastUpdateTimestamp.toNumber() * 1_000)
            console.log(' ├── lastUpdateTimestampAsDate:', lastUpdateTimestampAsDate)

            const lastRewardPerPoolToken = await this.rewardsContract.lastRewardPerPoolToken()
            console.log(' ├── lastRewardPerPoolToken():', web3.utils.fromWei(lastRewardPerPoolToken))

            const rewardPerToken = await this.rewardsContract.rewardPerToken()
            console.log(' ├── rewardPerToken():', web3.utils.fromWei(rewardPerToken))

            const elimuTokenBalance = await this.elimuTokenContract.balanceOf(this.rewardsContract.address)
            console.log(' ├── elimuTokenBalance:', web3.utils.fromWei(elimuTokenBalance))

            console.log(' ├── poolTokenBalances(account):')
            for (let i = 1; i < 3; i++) {
                const accountPoolTokenBalance = await this.rewardsContract.poolTokenBalances(accounts[i])
                const percentageOfContractPoolTokenBalance = accountPoolTokenBalance * 100 / poolTokenBalance
                console.log(' │   ├── account' + i + ': ' + web3.utils.fromWei(accountPoolTokenBalance) + ' (' + percentageOfContractPoolTokenBalance + '%)')
            }

            console.log(' ├── rewardPerTokenClaimed(account):')
            for (let i = 1; i < 3; i++) {
                const rewardPerTokenClaimed = await this.rewardsContract.rewardPerTokenClaimed(accounts[i])
                console.log(' │   ├── account' + i + ': ' + web3.utils.fromWei(rewardPerTokenClaimed))
            }

            console.log(' ├── rewardBalances(account):')
            for (let i = 1; i < 3; i++) {
                const reward = await this.rewardsContract.rewardBalances(accounts[i])
                console.log(' │   ├── account' + i + ': ' + web3.utils.fromWei(reward))
            }

            console.log(' └── claimableReward(address account):')
            for (let i = 1; i < 3; i++) {
                const rewardsEarned = await this.rewardsContract.claimableReward(accounts[i])
                console.log('     ├── account' + i + ': ' + web3.utils.fromWei(rewardsEarned))
            }
        }
    })

    it('deployed successfully', async () => {
        this.rewardsContract = await UniswapPoolRewards.deployed()
        const rewardsContractAddress = this.rewardsContract.address
        console.log('rewardsContractAddress:', rewardsContractAddress)
        assert.notEqual(rewardsContractAddress, 0x0)
        assert.notEqual(rewardsContractAddress, "")
        assert.notEqual(rewardsContractAddress, null)
        assert.notEqual(rewardsContractAddress, undefined)

        const elimuTokenAddress = await this.rewardsContract.elimuToken()
        this.elimuTokenContract = await ElimuTokenMock.at(elimuTokenAddress)
        console.log('elimuTokenAddress:', elimuTokenAddress)
        assert.notEqual(elimuTokenAddress, 0x0)
        assert.notEqual(elimuTokenAddress, "")
        assert.notEqual(elimuTokenAddress, null)
        assert.notEqual(elimuTokenAddress, undefined)

        const poolTokenAddress = await this.rewardsContract.poolToken()
        this.poolTokenContract = await PoolTokenMock.at(poolTokenAddress)
        console.log('poolTokenAddress:', poolTokenAddress)
        assert.notEqual(poolTokenAddress, 0x0)
        assert.notEqual(poolTokenAddress, "")
        assert.notEqual(poolTokenAddress, null)
        assert.notEqual(poolTokenAddress, undefined)
    })

    
    describe('\n💸 Reward Rate', () => {
        it('rewardRatePerSecond() - default value should be 0.125', async () => {
            const rewardRatePerSecond = await this.rewardsContract.rewardRatePerSecond()
            console.log('rewardRatePerSecond:', web3.utils.fromWei(rewardRatePerSecond))
            assert.equal(rewardRatePerSecond, web3.utils.toWei('0.125'))
        })

        it('rewardRatePerSecond() - contract deployer should be able to adjust the rate', async () => {
            const deployerAccount = accounts[0]
            console.log('deployerAccount:', deployerAccount)
            const doubleRewardRatePerSecond = web3.utils.toWei('0.250')
            console.log('doubleRewardRatePerSecond:', web3.utils.fromWei(doubleRewardRatePerSecond))
            await this.rewardsContract.setRewardRatePerSecond(doubleRewardRatePerSecond)
            const rewardRatePerSecond = await this.rewardsContract.rewardRatePerSecond()
            console.log('rewardRatePerSecond:', web3.utils.fromWei(rewardRatePerSecond))
            assert.equal(rewardRatePerSecond, web3.utils.toWei('0.250'))
        })
    })

    
    describe('\n💸 Rewards Earned', () => {
        it('claimableReward() - default value should be 0', async () => {
            const account1 = accounts[1]
            console.log('account1:', account1)
            const rewardsEarnedAccount1 = await this.rewardsContract.claimableReward(account1)
            console.log('rewardsEarnedAccount1:', web3.utils.fromWei(rewardsEarnedAccount1))
            assert.equal(rewardsEarnedAccount1, web3.utils.toWei('0'))
        })

        it('depositPoolTokens() - account1 deposits 10 pool tokens', async () => {
            const account0 = accounts[0]
            console.log('account0:', account0)
            const account1 = accounts[1]
            console.log('account1:', account1)

            // Expect a total pool token supply of 1,000 (see 1_deploy_uniswap_rewards.js)
            const poolTokenTotalSupply = await this.poolTokenContract.totalSupply()
            console.log('poolTokenTotalSupply:', web3.utils.fromWei(poolTokenTotalSupply))
            assert.equal(poolTokenTotalSupply, web3.utils.toWei('1000'))

            // Expect the pool token contract deployer to hold the total supply of 1,000 tokens
            const account0PoolTokenBalance = await this.poolTokenContract.balanceOf(account0)
            console.log('account0PoolTokenBalance:', web3.utils.fromWei(account0PoolTokenBalance))
            assert.equal(account0PoolTokenBalance, web3.utils.toWei('1000'))

            // Transfer 100 pool tokens from account0 to account1
            const transferResult = await this.poolTokenContract.transfer(account1, web3.utils.toWei('100'), { from: account0 })
            console.log('transferResult:', transferResult)
            const account1PoolTokenBalance = await this.poolTokenContract.balanceOf(account1)
            console.log('account1PoolTokenBalance:', web3.utils.fromWei(account1PoolTokenBalance))
            assert.equal(account1PoolTokenBalance, web3.utils.toWei('100'))

            // Approve 100 tokens to be spent by the rewards contract
            const approveResult = await this.poolTokenContract.approve(this.rewardsContract.address, web3.utils.toWei('100'), { from: account1 })
            console.log('approveResult:\n', approveResult)

            // Deposit 10 pool tokens into the rewards contract
            const depositPoolTokensResult = await this.rewardsContract.depositPoolTokens(web3.utils.toWei('10'), { from: account1 })
            console.log('depositPoolTokensResult:\n', depositPoolTokensResult)
            const account1PoolTokenBalanceAfterDeposit = await this.poolTokenContract.balanceOf(account1)
            console.log('account1PoolTokenBalanceAfterDeposit:', web3.utils.fromWei(account1PoolTokenBalanceAfterDeposit))
            assert.equal(account1PoolTokenBalanceAfterDeposit, web3.utils.toWei('90'))
            const poolTokenBalanceAfterDeposit = await this.poolTokenContract.balanceOf(this.rewardsContract.address)
            console.log('poolTokenBalanceAfterDeposit:', web3.utils.fromWei(poolTokenBalanceAfterDeposit))
            assert.equal(poolTokenBalanceAfterDeposit, web3.utils.toWei('10'))
        })

        it('rewardPerToken() - at the time of first deposit', async () => {
            // Verify zero rewards per token immediately after the deposit was made
            const rewardPerToken = await this.rewardsContract.rewardPerToken()
            console.log('rewardPerToken:', web3.utils.fromWei(rewardPerToken))
            assert.equal(rewardPerToken, web3.utils.toWei('0'))
        })

        it('claimableReward() - at the time of first deposit', async () => {
            // Verify zero rewards earned immediately after the deposit was made
            const rewardsEarnedAccount1 = await this.rewardsContract.claimableReward(accounts[1])
            console.log('rewardsEarnedAccount1:', web3.utils.fromWei(rewardsEarnedAccount1))
            assert.equal(rewardsEarnedAccount1, web3.utils.toWei('0'))
        })

        it('rewardPerToken() - 1 hour after first deposit', async () => {
            // Simulate an increase of block.timestamp by 1 hour
            const lastUpdateTimestampBeforeSimulation = await this.rewardsContract.lastUpdateTimestamp()
            console.log('lastUpdateTimestampBeforeSimulation.toNumber():', lastUpdateTimestampBeforeSimulation.toNumber())
            const lastUpdateTimestampBeforeSimulationAsDate = new Date(lastUpdateTimestampBeforeSimulation.toNumber() * 1_000)
            console.log('lastUpdateTimestampBeforeSimulationAsDate:', lastUpdateTimestampBeforeSimulationAsDate)
            const oneHourInSeconds = 60 * 60
            time.increase(oneHourInSeconds)

            // Deposit another 10 pool tokens into the rewards contract
            const depositPoolTokensResult = await this.rewardsContract.depositPoolTokens(web3.utils.toWei('10'), { from: accounts[1] })
            console.log('depositPoolTokensResult:\n', depositPoolTokensResult)
            const account1PoolTokenBalanceAfterDeposit = await this.poolTokenContract.balanceOf(accounts[1])
            console.log('account1PoolTokenBalanceAfterDeposit:', web3.utils.fromWei(account1PoolTokenBalanceAfterDeposit))
            assert.equal(account1PoolTokenBalanceAfterDeposit, web3.utils.toWei('80'))

            // Verify that the timestamp increased by 1 hour
            const lastUpdateTimestamp = await this.rewardsContract.lastUpdateTimestamp()
            console.log('lastUpdateTimestamp.toNumber():', lastUpdateTimestamp.toNumber())
            const lastUpdateTimestampAsDate = new Date(lastUpdateTimestamp.toNumber() * 1_000)
            console.log('lastUpdateTimestampAsDate:', lastUpdateTimestampAsDate)
            const lastUpdateTimestampDiff = lastUpdateTimestamp - lastUpdateTimestampBeforeSimulation
            console.log('lastUpdateTimestampDiff:', lastUpdateTimestampDiff)
            assert.isAtLeast(lastUpdateTimestampDiff, 3_600) // 60 seconds X 60 minutes
            assert.isAtMost(lastUpdateTimestampDiff, 3_600 * 1.01)

            // Verify that rewardPerToken() no longer returns zero
            const rewardPerToken = await this.rewardsContract.rewardPerToken()
            console.log('rewardPerToken:', web3.utils.fromWei(rewardPerToken))
            // TODO
        })

        it('claimableReward() - 1 hour after first deposit', async () => {
            const rewardsEarnedAccount1 = await this.rewardsContract.claimableReward(accounts[1])
            console.log('rewardsEarnedAccount1:', web3.utils.fromWei(rewardsEarnedAccount1))
            assert.isAtLeast(Number(web3.utils.fromWei(rewardsEarnedAccount1)), 900) // 0.250 $ELIMU/second X 3,600 seconds = 900 $ELIMU
            assert.isAtMost(Number(web3.utils.fromWei(rewardsEarnedAccount1)), 900 * 1.01)
        })

        it('claimableReward() - 1 hour after first deposit, account2 deposits another 20 pool tokens', async () => {
            await this.poolTokenContract.transfer(accounts[2], web3.utils.toWei('100'), { from: accounts[0] })
            await this.poolTokenContract.approve(this.rewardsContract.address, web3.utils.toWei('100'), { from: accounts[2] })
            await this.rewardsContract.depositPoolTokens(web3.utils.toWei('20'), { from: accounts[2] })
            const poolTokenBalance = await this.poolTokenContract.balanceOf(this.rewardsContract.address)
            console.log('poolTokenBalance:', web3.utils.fromWei(poolTokenBalance))
            assert.equal(poolTokenBalance, web3.utils.toWei('40')) // 20 + 20 = 40
            
            const rewardsEarnedAccount1 = await this.rewardsContract.claimableReward(accounts[1])
            console.log('rewardsEarnedAccount1:', web3.utils.fromWei(rewardsEarnedAccount1))
            assert.isAtLeast(Number(web3.utils.fromWei(rewardsEarnedAccount1)), 900)
            assert.isAtMost(Number(web3.utils.fromWei(rewardsEarnedAccount1)), 900 * 1.01)

            const rewardsEarnedAccount2 = await this.rewardsContract.claimableReward(accounts[2])
            console.log('rewardsEarnedAccount2:', web3.utils.fromWei(rewardsEarnedAccount2))
            assert.equal(rewardsEarnedAccount2, web3.utils.toWei('0'))
        })

        it('claimableReward() - 2 hours after first deposit', async () => {
            // Expected earned (claimable) rewards per account:
            //  0 hours     (0/0):     account1    0 $ELIMU,
            //  0→1 hour   (10/0):     account1  900 $ELIMU,    account2   0 $ELIMU
            //  1→2 hours (20/20):     account1 1350 $ELIMU,    account2 450 $ELIMUs
            
            // Simulate an increase of block.timestamp by 1 hour
            time.increase(60 * 60)

            const totalDepositedByAccount1 = await this.rewardsContract.poolTokenBalances(accounts[1])
            console.log('totalDepositedByAccount1:', web3.utils.fromWei(totalDepositedByAccount1))
            const rewardsEarnedAccount1 = await this.rewardsContract.claimableReward(accounts[1])
            console.log('rewardsEarnedAccount1:', web3.utils.fromWei(rewardsEarnedAccount1))
            assert.isAtLeast(Number(web3.utils.fromWei(rewardsEarnedAccount1)), 1_350) // 900 + 450
            assert.isAtMost(Number(web3.utils.fromWei(rewardsEarnedAccount1)), 1_350 * 1.01)

            const totalDepositedByAccount2 = await this.rewardsContract.poolTokenBalances(accounts[2])
            console.log('totalDepositedByAccount2:', web3.utils.fromWei(totalDepositedByAccount2))
            const rewardsEarnedAccount2 = await this.rewardsContract.claimableReward(accounts[2])
            console.log('rewardsEarnedAccount2:', web3.utils.fromWei(rewardsEarnedAccount2))
            assert.isAtLeast(Number(web3.utils.fromWei(rewardsEarnedAccount2)), 450) // 0 + 450
            assert.isAtMost(Number(web3.utils.fromWei(rewardsEarnedAccount2)), 450 * 1.01)
        })

        it('claimableReward() - 3 hours after first deposit', async () => {
            // Expected earned (claimable) rewards per account:
            //  0 hours     (0/0):     account1    0 $ELIMU,
            //  0→1 hour   (10/0):     account1  900 $ELIMU,    account2   0 $ELIMU
            //  1→2 hours (20/20):     account1 1350 $ELIMU,    account2 450 $ELIMUs
            //  2→3 hours (20/20):     account1 1800 $ELIMU,    account2 900 $ELIMUs
            
            // Simulate an increase of block.timestamp by 1 hour
            time.increase(60 * 60)

            const totalDepositedByAccount1 = await this.rewardsContract.poolTokenBalances(accounts[1])
            console.log('totalDepositedByAccount1:', web3.utils.fromWei(totalDepositedByAccount1))
            const rewardsEarnedAccount1 = await this.rewardsContract.claimableReward(accounts[1])
            console.log('rewardsEarnedAccount1:', web3.utils.fromWei(rewardsEarnedAccount1))
            assert.isAtLeast(Number(web3.utils.fromWei(rewardsEarnedAccount1)), 1_800) // (900 + 450) + 450
            assert.isAtMost(Number(web3.utils.fromWei(rewardsEarnedAccount1)), 1_800 * 1.01)

            const totalDepositedByAccount2 = await this.rewardsContract.poolTokenBalances(accounts[2])
            console.log('totalDepositedByAccount2:', web3.utils.fromWei(totalDepositedByAccount2))
            const rewardsEarnedAccount2 = await this.rewardsContract.claimableReward(accounts[2])
            console.log('rewardsEarnedAccount2:', web3.utils.fromWei(rewardsEarnedAccount2))
            assert.isAtLeast(Number(web3.utils.fromWei(rewardsEarnedAccount2)), 900) // (0 + 450) + 450
            assert.isAtMost(Number(web3.utils.fromWei(rewardsEarnedAccount2)), 900 * 1.01)
        })
    })


    describe('\n💸 Reward Rate Adjustment - 3 hours after first deposit', () => {
        it('setRewardRatePerSecond() - increase rate from 0.250 to 0.500', async () => {
            const doubleRewardRatePerSecond = web3.utils.toWei('0.500')
            const setRewardRatePerSecondResult = await this.rewardsContract.setRewardRatePerSecond(doubleRewardRatePerSecond)
            console.log('setRewardRatePerSecondResult:\n', setRewardRatePerSecondResult)
            const rewardRatePerSecond = await this.rewardsContract.rewardRatePerSecond()
            console.log('rewardRatePerSecond:', web3.utils.fromWei(rewardRatePerSecond))
            assert.equal(rewardRatePerSecond, web3.utils.toWei('0.500'))
        })

        it('claimableReward() - 4 hours after first deposit', async () => {
            // Expected earned (claimable) rewards per account:
            //  0 hours     (0/0):     account1    0 $ELIMU,
            //  0→1 hour   (10/0):     account1  900 $ELIMU,    account2    0 $ELIMU
            //  1→2 hours (20/20):     account1 1350 $ELIMU,    account2  450 $ELIMUs
            //  2→3 hours (20/20):     account1 1800 $ELIMU,    account2  900 $ELIMUs
            //  3→4 hours (20/20):     account1 2700 $ELIMU,    account2 1800 $ELIMUs
            
            // Simulate an increase of block.timestamp by 1 hour
            time.increase(60 * 60)

            const totalDepositedByAccount1 = await this.rewardsContract.poolTokenBalances(accounts[1])
            console.log('totalDepositedByAccount1:', web3.utils.fromWei(totalDepositedByAccount1))
            const rewardsEarnedAccount1 = await this.rewardsContract.claimableReward(accounts[1])
            console.log('rewardsEarnedAccount1:', web3.utils.fromWei(rewardsEarnedAccount1))
            assert.isAtLeast(Number(web3.utils.fromWei(rewardsEarnedAccount1)), 2_700) // (900 + 450 + 450) + 900
            assert.isAtMost(Number(web3.utils.fromWei(rewardsEarnedAccount1)), 2_700 * 1.01)

            const totalDepositedByAccount2 = await this.rewardsContract.poolTokenBalances(accounts[2])
            console.log('totalDepositedByAccount2:', web3.utils.fromWei(totalDepositedByAccount2))
            const rewardsEarnedAccount2 = await this.rewardsContract.claimableReward(accounts[2])
            console.log('rewardsEarnedAccount2:', web3.utils.fromWei(rewardsEarnedAccount2))
            assert.isAtLeast(Number(web3.utils.fromWei(rewardsEarnedAccount2)), 1_800) // (0 + 450 + 450) + 900
            assert.isAtMost(Number(web3.utils.fromWei(rewardsEarnedAccount2)), 1_800 * 1.01)
        })
    })


    describe('\n💸 Reward Rate Adjustment - 4 hours after first deposit', () => {
        it('setRewardRatePerSecond() - reduce rate from 0.500 to 0', async () => {
            await this.rewardsContract.setRewardRatePerSecond(web3.utils.toWei('0'))
            const rewardRatePerSecond = await this.rewardsContract.rewardRatePerSecond()
            console.log('rewardRatePerSecond:', web3.utils.fromWei(rewardRatePerSecond))
            assert.equal(rewardRatePerSecond, web3.utils.toWei('0'))
        })

        it('claimableReward() - 5 hours after first deposit', async () => {
            // Expected earned (claimable) rewards per account:
            //  0 hours     (0/0):     account1    0 $ELIMU,
            //  0→1 hour   (10/0):     account1  900 $ELIMU,    account2    0 $ELIMU
            //  1→2 hours (20/20):     account1 1350 $ELIMU,    account2  450 $ELIMUs
            //  2→3 hours (20/20):     account1 1800 $ELIMU,    account2  900 $ELIMUs
            //  3→4 hours (20/20):     account1 2700 $ELIMU,    account2 1800 $ELIMUs
            //  4→5 hours (20/20):     account1 2700 $ELIMU,    account2 1800 $ELIMUs
            
            // Simulate an increase of block.timestamp by 1 hour
            time.increase(60 * 60)
            
            const totalDepositedByAccount1 = await this.rewardsContract.poolTokenBalances(accounts[1])
            console.log('totalDepositedByAccount1:', web3.utils.fromWei(totalDepositedByAccount1))
            const rewardsEarnedAccount1 = await this.rewardsContract.claimableReward(accounts[1])
            console.log('rewardsEarnedAccount1:', web3.utils.fromWei(rewardsEarnedAccount1))
            assert.isAtLeast(Number(web3.utils.fromWei(rewardsEarnedAccount1)), 2_700) // (900 + 450 + 450 + 900) + 0
            assert.isAtMost(Number(web3.utils.fromWei(rewardsEarnedAccount1)), 2_700 * 1.01)

            const totalDepositedByAccount2 = await this.rewardsContract.poolTokenBalances(accounts[2])
            console.log('totalDepositedByAccount2:', web3.utils.fromWei(totalDepositedByAccount2))
            const rewardsEarnedAccount2 = await this.rewardsContract.claimableReward(accounts[2])
            console.log('rewardsEarnedAccount2:', web3.utils.fromWei(rewardsEarnedAccount2))
            assert.isAtLeast(Number(web3.utils.fromWei(rewardsEarnedAccount2)), 1_800) // (0 + 450 + 450 + 900) + 0
            assert.isAtMost(Number(web3.utils.fromWei(rewardsEarnedAccount2)), 1_800 * 1.01)
        })
    })


    describe('\n💸 Reward Rate Adjustment - 5 hours after first deposit', () => {
        it('setRewardRatePerSecond() - increase rate from 0 to 1.0', async () => {
            await this.rewardsContract.setRewardRatePerSecond(web3.utils.toWei('1.0'))
            const rewardRatePerSecond = await this.rewardsContract.rewardRatePerSecond()
            console.log('rewardRatePerSecond:', web3.utils.fromWei(rewardRatePerSecond))
            assert.equal(rewardRatePerSecond, web3.utils.toWei('1.0'))
        })

        it('claimableReward() - 6 hours after first deposit', async () => {
            // Expected earned (claimable) rewards per account:
            //  0 hours     (0/0):     account1    0 $ELIMU,
            //  0→1 hour   (10/0):     account1  900 $ELIMU,    account2    0 $ELIMU
            //  1→2 hours (20/20):     account1 1350 $ELIMU,    account2  450 $ELIMUs
            //  2→3 hours (20/20):     account1 1800 $ELIMU,    account2  900 $ELIMUs
            //  3→4 hours (20/20):     account1 2700 $ELIMU,    account2 1800 $ELIMUs
            //  4→5 hours (20/20):     account1 2700 $ELIMU,    account2 1800 $ELIMUs
            //  5→6 hours (20/20):     account1 4500 $ELIMU,    account2 3600 $ELIMUs
            
            // Simulate an increase of block.timestamp by 1 hour
            time.increase(60 * 60)
            
            const totalDepositedByAccount1 = await this.rewardsContract.poolTokenBalances(accounts[1])
            console.log('totalDepositedByAccount1:', web3.utils.fromWei(totalDepositedByAccount1))
            const rewardsEarnedAccount1 = await this.rewardsContract.claimableReward(accounts[1])
            console.log('rewardsEarnedAccount1:', web3.utils.fromWei(rewardsEarnedAccount1))
            assert.isAtLeast(Number(web3.utils.fromWei(rewardsEarnedAccount1)), 4_500) // (900 + 450 + 450 + 900 + 0) + 1800
            assert.isAtMost(Number(web3.utils.fromWei(rewardsEarnedAccount1)), 4_500 * 1.01)

            const totalDepositedByAccount2 = await this.rewardsContract.poolTokenBalances(accounts[2])
            console.log('totalDepositedByAccount2:', web3.utils.fromWei(totalDepositedByAccount2))
            const rewardsEarnedAccount2 = await this.rewardsContract.claimableReward(accounts[2])
            console.log('rewardsEarnedAccount2:', web3.utils.fromWei(rewardsEarnedAccount2))
            assert.isAtLeast(Number(web3.utils.fromWei(rewardsEarnedAccount2)), 3_600) // (0 + 450 + 450 + 900 + 0) + 1800
            assert.isAtMost(Number(web3.utils.fromWei(rewardsEarnedAccount2)), 3_600 * 1.01)
        })
    })


    describe('\n💸 Claim Reward - 6 hours after first deposit', () => {
        it('deployer account funds rewards contract', async () => {
            // Expect the deployer account to hold the total supply of 38,700,000 $ELIMU tokens
            const account0ElimuTokenBalance = await this.elimuTokenContract.balanceOf(accounts[0])
            console.log('account0ElimuTokenBalance:', web3.utils.fromWei(account0ElimuTokenBalance))
            assert.equal(account0ElimuTokenBalance, web3.utils.toWei('38700000'))

            // Transfer 322,500 $ELIMU tokens from the deployer account to the rewards contract
            const transferResult = await this.elimuTokenContract.transfer(this.rewardsContract.address, web3.utils.toWei('322500'), { from: accounts[0] })
            console.log('transferResult:', transferResult)
            const elimuTokenBalance = await this.elimuTokenContract.balanceOf(this.rewardsContract.address)
            console.log('elimuTokenBalance:', web3.utils.fromWei(elimuTokenBalance))
            assert.equal(elimuTokenBalance, web3.utils.toWei('322500'))
        })
        
        it('claimReward() - account1', async () => {
            const rewardsEarnedAccount1 = await this.rewardsContract.claimableReward(accounts[1])
            console.log('rewardsEarnedAccount1:', web3.utils.fromWei(rewardsEarnedAccount1))

            const elimuTokenBalanceBeforeClaiming = await this.elimuTokenContract.balanceOf(this.rewardsContract.address)
            console.log('elimuTokenBalanceBeforeClaiming:', web3.utils.fromWei(elimuTokenBalanceBeforeClaiming))

            const elimuTokenBalanceAccount1BeforeClaiming = await this.elimuTokenContract.balanceOf(accounts[1])
            console.log('elimuTokenBalanceAccount1BeforeClaiming:', web3.utils.fromWei(elimuTokenBalanceAccount1BeforeClaiming))
            assert.equal(elimuTokenBalanceAccount1BeforeClaiming, web3.utils.toWei('0'))

            const claimRewardResult = await this.rewardsContract.claimReward({ from: accounts[1] })
            console.log('claimRewardResult:\n', claimRewardResult)

            const elimuTokenBalanceAfterClaiming = await this.elimuTokenContract.balanceOf(this.rewardsContract.address)
            console.log('elimuTokenBalanceAfterClaiming:', web3.utils.fromWei(elimuTokenBalanceAfterClaiming))
            assert.isAtMost(Number(web3.utils.fromWei(elimuTokenBalanceAfterClaiming)), elimuTokenBalanceBeforeClaiming - elimuTokenBalanceAccount1BeforeClaiming)

            const elimuTokenBalanceAccount1AfterClaiming = await this.elimuTokenContract.balanceOf(accounts[1])
            console.log('elimuTokenBalanceAccount1AfterClaiming:', web3.utils.fromWei(elimuTokenBalanceAccount1AfterClaiming))

            // Expected earned (claimable) rewards per account:
            //  0 hours     (0/0):     account1    0 $ELIMU,
            //  0→1 hour   (10/0):     account1  900 $ELIMU,    account2    0 $ELIMU
            //  1→2 hours (20/20):     account1 1350 $ELIMU,    account2  450 $ELIMUs
            //  2→3 hours (20/20):     account1 1800 $ELIMU,    account2  900 $ELIMUs
            //  3→4 hours (20/20):     account1 2700 $ELIMU,    account2 1800 $ELIMUs
            //  4→5 hours (20/20):     account1 2700 $ELIMU,    account2 1800 $ELIMUs
            //  5→6 hours (20/20):     account1    0 $ELIMU,    account2 3600 $ELIMUs
            
            // Verify that account1's earned rewards is now zero
            const rewardsEarnedAccount1AfterClaiming = await this.rewardsContract.claimableReward(accounts[1])
            console.log('rewardsEarnedAccount1AfterClaiming:', web3.utils.fromWei(rewardsEarnedAccount1AfterClaiming))
            assert.equal(rewardsEarnedAccount1AfterClaiming, web3.utils.toWei('0')) // (900 + 450 + 450 + 900 + 0 + 1800) - 4500

            // Verify that account2's earned rewards remains the same
            const rewardsEarnedAccount2AfterClaiming = await this.rewardsContract.claimableReward(accounts[2])
            console.log('rewardsEarnedAccount2AfterClaiming:', web3.utils.fromWei(rewardsEarnedAccount2AfterClaiming))
            assert.isAtLeast(Number(web3.utils.fromWei(rewardsEarnedAccount2AfterClaiming)), 3_600) // (0 + 450 + 450 + 900 + 0) + 1800
            assert.isAtMost(Number(web3.utils.fromWei(rewardsEarnedAccount2AfterClaiming)), 3_600 * 1.01)
        })

        it('claimReward() - account1, Nothing to claim', async () => {
            const rewardsEarnedAccount1 = await this.rewardsContract.claimableReward(accounts[1])
            console.log('rewardsEarnedAccount1:', web3.utils.fromWei(rewardsEarnedAccount1))

            // Expect the transaction to be reverted with a "Nothing to claim" error
            try {
                await this.rewardsContract.claimReward({ from: accounts[1] })
            } catch (error) {
                console.log('error:\n', error)
                assert.equal(error.reason, "Nothing to claim")
            }
        })

        it('claimReward() - account without rewards cannot claim', async () => {
            const rewardsEarnedAccount3 = await this.rewardsContract.claimableReward(accounts[3])
            console.log('rewardsEarnedAccount3:', web3.utils.fromWei(rewardsEarnedAccount3))

            // Expect the transaction to be reverted with a "Nothing to claim" error
            try {
                await this.rewardsContract.claimReward({ from: accounts[3] })
            } catch (error) {
                console.log('error:\n', error)
                assert.equal(error.reason, "Nothing to claim")
            }
        })

        it('claimableReward() - 7 hours after first deposit', async () => {
            // Expected earned (claimable) rewards per account:
            //  0 hours     (0/0):     account1    0 $ELIMU,
            //  0→1 hour   (10/0):     account1  900 $ELIMU,    account2    0 $ELIMU
            //  1→2 hours (20/20):     account1 1350 $ELIMU,    account2  450 $ELIMUs
            //  2→3 hours (20/20):     account1 1800 $ELIMU,    account2  900 $ELIMUs
            //  3→4 hours (20/20):     account1 2700 $ELIMU,    account2 1800 $ELIMUs
            //  4→5 hours (20/20):     account1 2700 $ELIMU,    account2 1800 $ELIMUs
            //  5→6 hours (20/20):     account1    0 $ELIMU,    account2 3600 $ELIMUs
            //  6→7 hours (20/20):     account1 1800 $ELIMU,    account2 5400 $ELIMUs
            
            // Simulate an increase of block.timestamp by 1 hour
            time.increase(60 * 60)
            
            const totalDepositedByAccount1 = await this.rewardsContract.poolTokenBalances(accounts[1])
            console.log('totalDepositedByAccount1:', web3.utils.fromWei(totalDepositedByAccount1))
            const rewardsEarnedAccount1 = await this.rewardsContract.claimableReward(accounts[1])
            console.log('rewardsEarnedAccount1:', web3.utils.fromWei(rewardsEarnedAccount1))
            assert.isAtLeast(Number(web3.utils.fromWei(rewardsEarnedAccount1)), 1_800) // 0 + 1800
            assert.isAtMost(Number(web3.utils.fromWei(rewardsEarnedAccount1)), 1_800 * 1.01)

            const totalDepositedByAccount2 = await this.rewardsContract.poolTokenBalances(accounts[2])
            console.log('totalDepositedByAccount2:', web3.utils.fromWei(totalDepositedByAccount2))
            const rewardsEarnedAccount2 = await this.rewardsContract.claimableReward(accounts[2])
            console.log('rewardsEarnedAccount2:', web3.utils.fromWei(rewardsEarnedAccount2))
            assert.isAtLeast(Number(web3.utils.fromWei(rewardsEarnedAccount2)), 5_400) // (0 + 450 + 450 + 900 + 0 + 1800) + 1800
            assert.isAtMost(Number(web3.utils.fromWei(rewardsEarnedAccount2)), 5_400 * 1.01)
        })
    })


    describe('\n💸 Withdraw Pool Tokens - 7 hours after first deposit', () => {
        it('withdrawPoolTokens() - account2 withdraws 20 pool tokens', async () => {
            // Verify that account2 has deposited a total of 20 pool tokens
            const totalDepositedByAccount2 = await this.rewardsContract.poolTokenBalances(accounts[2])
            console.log('totalDepositedByAccount2:', web3.utils.fromWei(totalDepositedByAccount2))
            assert.equal(totalDepositedByAccount2, web3.utils.toWei('20'))
            
            // account2 withdraws the 20 pool tokens
            const withdrawPoolTokensResult = await this.rewardsContract.withdrawPoolTokens({ from: accounts[2] })
            console.log('withdrawPoolTokensResult:\n', withdrawPoolTokensResult)

            // Verify that account2 has deposited a total of 00 pool tokens
            const totalDepositedByAccount2AfterWithdrawal = await this.rewardsContract.poolTokenBalances(accounts[2])
            console.log('totalDepositedByAccount2AfterWithdrawal:', web3.utils.fromWei(totalDepositedByAccount2AfterWithdrawal))
            assert.equal(totalDepositedByAccount2AfterWithdrawal, web3.utils.toWei('0')) // 20 - 20

            // Verify that account2 holds 100 pool tokens
            const account2PoolTokenBalance = await this.poolTokenContract.balanceOf(accounts[2])
            console.log('account2PoolTokenBalance:', web3.utils.fromWei(account2PoolTokenBalance))
            assert.equal(account2PoolTokenBalance, web3.utils.toWei('100')) // 100 - 20 + 20
        })

        it('withdrawPoolTokens() - account without deposits cannot withdraw', async () => {
            const totalDepositedByAccount3 = await this.rewardsContract.poolTokenBalances(accounts[3])
            console.log('totalDepositedByAccount3:', web3.utils.fromWei(totalDepositedByAccount3))
            assert.equal(totalDepositedByAccount3, web3.utils.toWei('0'))

            // Expect the transaction to be reverted with an error
            try {
                await this.rewardsContract.withdrawPoolTokens({ from: accounts[3] })
            } catch (error) {
                console.log('error:\n', error)
                assert.equal(error.reason, "Cannot withdraw 0")
            }
        })
    })
})
