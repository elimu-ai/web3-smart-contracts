const UniswapPoolRewards = artifacts.require("UniswapPoolRewards")

contract("UniswapPoolRewards", (accounts) => {
    
    console.log('accounts:', accounts)

    beforeEach(async () => {
        this.contract = await UniswapPoolRewards.deployed()
    })

    it('deployed successfully', async () => {
        const address = await this.contract.address
        console.log('\naddress:', address)
        assert.notEqual(address, 0x0)
        assert.notEqual(address, "")
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)

        // TODO: assert elimuToken
        // TODO: assert poolToken
    })

    describe('\nReward Rate', () => {
        it('rewardRatePerSecond() - default value should be 0.125', async () => {
            const rewardRatePerSecond = await this.contract.rewardRatePerSecond()
            console.log('\nrewardRatePerSecond.toString():', rewardRatePerSecond.toString())
            assert.equal(rewardRatePerSecond, web3.utils.toWei('0.125'))
        })

        it('rewardRatePerSecond() - contract deployer should be able to adjust the rate', async () => {
            const deployerAccount = accounts[0]
            console.log('\ndeployerAccount:', deployerAccount)
            const doubleRewardRatePerSecond = web3.utils.toWei('0.250')
            console.log('doubleRewardRatePerSecond:', doubleRewardRatePerSecond)
            await this.contract.setRewardRatePerSecond(doubleRewardRatePerSecond)
            const rewardRatePerSecond = await this.contract.rewardRatePerSecond()
            console.log('rewardRatePerSecond.toString():', rewardRatePerSecond.toString())
            assert.equal(rewardRatePerSecond, web3.utils.toWei('0.250'))
        })
    })

    it('rewardsEarned() - default value should be 0', async () => {
        const account1 = accounts[1]
        console.log('\naccount1:', account1)
        const rewardsEarnedAccount1 = await this.contract.rewardsEarned(account1)
        console.log('rewardsEarnedAccount1.toString():', rewardsEarnedAccount1.toString())
        assert.equal(rewardsEarnedAccount1, 0)
    })

    it('depositPoolTokens() - account1 deposits 100 pool tokens', async () => {
        const account1 = accounts[1]
        console.log('\naccount1:', account1)
        // TODO: use account1 as msg.sender

        const spender = this.contract.address
        console.log('spender:', spender)
        const amount = web3.utils.toWei('100')
        console.log('amount:', amount)
        // await this.contract.poolToken().approve(spender, amount)

        // await this.contract.depositPoolTokens(amount)
    })
})
