const UniswapPoolRewards = artifacts.require("UniswapPoolRewards")
const ElimuTokenMock = artifacts.require("ERC20Mock")
const PoolTokenMock = artifacts.require("ERC20Mock")

contract("UniswapPoolRewards", (accounts) => {

    beforeEach(async () => {
        this.rewardsContract = await UniswapPoolRewards.deployed()

        const elimuTokenAddress = await this.rewardsContract.elimuToken()
        this.elimuTokenContract = await ElimuTokenMock.at(elimuTokenAddress)

        const poolTokenAddress = await this.rewardsContract.poolToken()
        this.poolTokenContract = await PoolTokenMock.at(poolTokenAddress)
    })

    it('deployed successfully', async () => {
        const rewardsContractAddress = await this.rewardsContract.address
        console.log('\rewardsContractAddress:', rewardsContractAddress)
        assert.notEqual(rewardsContractAddress, 0x0)
        assert.notEqual(rewardsContractAddress, "")
        assert.notEqual(rewardsContractAddress, null)
        assert.notEqual(rewardsContractAddress, undefined)

        const elimuTokenAddress = await this.rewardsContract.elimuToken()
        console.log('elimuTokenAddress:', elimuTokenAddress)
        assert.notEqual(elimuTokenAddress, 0x0)
        assert.notEqual(elimuTokenAddress, "")
        assert.notEqual(elimuTokenAddress, null)
        assert.notEqual(elimuTokenAddress, undefined)

        const poolTokenAddress = await this.rewardsContract.poolToken()
        console.log('poolTokenAddress:', poolTokenAddress)
        assert.notEqual(poolTokenAddress, 0x0)
        assert.notEqual(poolTokenAddress, "")
        assert.notEqual(poolTokenAddress, null)
        assert.notEqual(poolTokenAddress, undefined)
    })

    describe('\nReward Rate', () => {
        it('rewardRatePerSecond() - default value should be 0.125', async () => {
            const rewardRatePerSecond = await this.rewardsContract.rewardRatePerSecond()
            console.log('\nrewardRatePerSecond.toString():', rewardRatePerSecond.toString())
            assert.equal(rewardRatePerSecond, web3.utils.toWei('0.125'))
        })

        it('rewardRatePerSecond() - contract deployer should be able to adjust the rate', async () => {
            const deployerAccount = accounts[0]
            console.log('\ndeployerAccount:', deployerAccount)
            const doubleRewardRatePerSecond = web3.utils.toWei('0.250')
            console.log('doubleRewardRatePerSecond:', doubleRewardRatePerSecond)
            await this.rewardsContract.setRewardRatePerSecond(doubleRewardRatePerSecond)
            const rewardRatePerSecond = await this.rewardsContract.rewardRatePerSecond()
            console.log('rewardRatePerSecond.toString():', rewardRatePerSecond.toString())
            assert.equal(rewardRatePerSecond, web3.utils.toWei('0.250'))
        })
    })

    it('rewardsEarned() - default value should be 0', async () => {
        const account1 = accounts[1]
        console.log('\naccount1:', account1)
        const rewardsEarnedAccount1 = await this.rewardsContract.rewardsEarned(account1)
        console.log('rewardsEarnedAccount1.toString():', rewardsEarnedAccount1.toString())
        assert.equal(rewardsEarnedAccount1, 0)
    })

    it('depositPoolTokens() - account1 deposits 100 pool tokens', async () => {
        const account0 = accounts[0]
        console.log('\naccount0:', account0)
        const account1 = accounts[1]
        console.log('account1:', account1)

        // Expect a total pool token supply of 1,000 (see 1_deploy_uniswap_rewards.js)
        const poolTokenTotalSupply = await this.poolTokenContract.totalSupply()
        console.log('poolTokenTotalSupply.toString():', poolTokenTotalSupply.toString())
        assert.equal(poolTokenTotalSupply, web3.utils.toWei('1000'))

        // Expect the pool token contract deployer to hold the total supply of 1,000 tokens
        const account0PoolTokenBalance = await this.poolTokenContract.balanceOf(account0)
        console.log('account0PoolTokenBalance.toString():', account0PoolTokenBalance.toString())
        assert.equal(account0PoolTokenBalance, web3.utils.toWei('1000'))

        // Transfer 100 pool tokens from account0 to account1
        const transferResult = await this.poolTokenContract.transfer(account1, web3.utils.toWei('100'), { from: account0 })
        console.log('transferResult:', transferResult)
        const account1PoolTokenBalance = await this.poolTokenContract.balanceOf(account1)
        console.log('account1PoolTokenBalance.toString():', account1PoolTokenBalance.toString())
        assert.equal(account1PoolTokenBalance, web3.utils.toWei('100'))

        // Approve 100 tokens to be spent by the rewards contract
        const spender = this.rewardsContract.address
        console.log('spender:', spender)
        const amount = web3.utils.toWei('100')
        console.log('amount:', amount)
        const approveResult = await this.poolTokenContract.approve(spender, amount, { from: account1 })
        console.log('approveResult:\n', approveResult)

        // Deposit 100 pool tokens into the rewards contract
        const depositPoolTokensResult = await this.rewardsContract.depositPoolTokens(amount, { from: account1 })
        console.log('depositPoolTokensResult:\n', depositPoolTokensResult)
        const account1PoolTokenBalanceAfterDeposit = await this.poolTokenContract.balanceOf(account1)
        console.log('account1PoolTokenBalanceAfterDeposit.toString():', account1PoolTokenBalanceAfterDeposit.toString())
        assert.equal(account1PoolTokenBalanceAfterDeposit, 0)
        const rewardsContractAddress = await this.rewardsContract.address
        const rewardsContractPoolTokenBalanceAfterDeposit = await this.poolTokenContract.balanceOf(rewardsContractAddress)
        console.log('rewardsContractPoolTokenBalanceAfterDeposit.toString():', rewardsContractPoolTokenBalanceAfterDeposit.toString())
        assert.equal(rewardsContractPoolTokenBalanceAfterDeposit, web3.utils.toWei('100'))
    })
})
