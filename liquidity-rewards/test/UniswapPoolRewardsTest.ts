const UniswapPoolRewards = artifacts.require("UniswapPoolRewards")
const ElimuTokenMock = artifacts.require("ERC20Mock")
const PoolTokenMock = artifacts.require("ERC20Mock")
const { time } = require('@openzeppelin/test-helpers')

contract("UniswapPoolRewards", (accounts) => {

    beforeEach(async () => {
        console.log('\n🔁 beforeEach()')
        // TODO: reset contract/account state?
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
        it('rewardsEarned() - default value should be 0', async () => {
            const account1 = accounts[1]
            console.log('account1:', account1)
            const rewardsEarnedAccount1 = await this.rewardsContract.rewardsEarned(account1)
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
            const totalSupply = await this.rewardsContract.totalSupply()
            console.log('totalSupply:', web3.utils.fromWei(totalSupply))

            const rewardPerTokenDeposited = await this.rewardsContract.rewardPerTokenDeposited()
            console.log('rewardPerTokenDeposited:', web3.utils.fromWei(rewardPerTokenDeposited))
            
            const lastUpdateTime = await this.rewardsContract.lastUpdateTime()
            console.log('lastUpdateTime.toNumber():', lastUpdateTime.toNumber())
            const lastUpdateTimeAsDate = new Date(lastUpdateTime.toNumber() * 1_000)
            console.log('lastUpdateTimeAsDate:', lastUpdateTimeAsDate)

            const rewardRatePerSecond = await this.rewardsContract.rewardRatePerSecond()
            console.log('rewardRatePerSecond:', web3.utils.fromWei(rewardRatePerSecond))

            // Verify zero rewards earned immediately after the deposit was made
            const rewardPerToken = await this.rewardsContract.rewardPerToken()
            console.log('rewardPerToken:', web3.utils.fromWei(rewardPerToken))
            assert.equal(rewardPerToken, web3.utils.toWei('0'))
        })

        it('rewardsEarned() - at the time of first deposit', async () => {
            // Verify zero rewards earned immediately after the deposit was made
            const rewardsEarnedAccount1 = await this.rewardsContract.rewardsEarned(accounts[1])
            console.log('rewardsEarnedAccount1:', web3.utils.fromWei(rewardsEarnedAccount1))
            assert.equal(rewardsEarnedAccount1, web3.utils.toWei('0'))
        })

        it('rewardPerToken() - 1 hour after first deposit', async () => {
            // Simulate an increase of block.timestamp by 1 hour
            const lastUpdateTimeBeforeSimulation = await this.rewardsContract.lastUpdateTime()
            console.log('lastUpdateTimeBeforeSimulation.toNumber():', lastUpdateTimeBeforeSimulation.toNumber())
            const lastUpdateTimeBeforeSimulationAsDate = new Date(lastUpdateTimeBeforeSimulation.toNumber() * 1_000)
            console.log('lastUpdateTimeBeforeSimulationAsDate:', lastUpdateTimeBeforeSimulationAsDate)
            const oneHourInSeconds = 60 * 60
            time.increase(oneHourInSeconds)

            // Deposit another 10 pool tokens into the rewards contract
            const depositPoolTokensResult = await this.rewardsContract.depositPoolTokens(web3.utils.toWei('10'), { from: accounts[1] })
            console.log('depositPoolTokensResult:\n', depositPoolTokensResult)
            const account1PoolTokenBalanceAfterDeposit = await this.poolTokenContract.balanceOf(accounts[1])
            console.log('account1PoolTokenBalanceAfterDeposit:', web3.utils.fromWei(account1PoolTokenBalanceAfterDeposit))
            assert.equal(account1PoolTokenBalanceAfterDeposit, web3.utils.toWei('80'))

            // Verify that the timestamp increased by 1 hour
            const lastUpdateTime = await this.rewardsContract.lastUpdateTime()
            console.log('lastUpdateTime.toNumber():', lastUpdateTime.toNumber())
            const lastUpdateTimeAsDate = new Date(lastUpdateTime.toNumber() * 1_000)
            console.log('lastUpdateTimeAsDate:', lastUpdateTimeAsDate)
            const lastUpdateTimeDiff = lastUpdateTime - lastUpdateTimeBeforeSimulation
            console.log('lastUpdateTimeDiff:', lastUpdateTimeDiff)
            assert.isAtLeast(lastUpdateTimeDiff, 3_600) // 60 seconds X 60 minutes

            // Verify that rewardPerToken() no longer returns zero
            const rewardPerToken = await this.rewardsContract.rewardPerToken()
            console.log('rewardPerToken:', web3.utils.fromWei(rewardPerToken))
            // TODO



            // ----------
            // Print additional numbers for debugging:

            const totalSupply = await this.rewardsContract.totalSupply()
            console.log('totalSupply:', web3.utils.fromWei(totalSupply))

            const rewardPerTokenDeposited = await this.rewardsContract.rewardPerTokenDeposited()
            console.log('rewardPerTokenDeposited:', web3.utils.fromWei(rewardPerTokenDeposited))

            const rewardRatePerSecond = await this.rewardsContract.rewardRatePerSecond()
            console.log('rewardRatePerSecond:', web3.utils.fromWei(rewardRatePerSecond))

            const rewardsEarnedAccount1 = await this.rewardsContract.rewardsEarned(accounts[1])
            console.log('rewardsEarnedAccount1:', web3.utils.fromWei(rewardsEarnedAccount1))

            // ----------
        })

        it('rewardsEarned() - 1 hour after first deposit', async () => {
            // TODO
        })
    })
})
