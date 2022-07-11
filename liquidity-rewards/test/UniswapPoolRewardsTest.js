const { BN, time } = require('@openzeppelin/test-helpers');
const { expect, assert } = require('chai');


const ERC20Mock = artifacts.require('ERC20Mock');
const UniswapPoolRewards = artifacts.require('UniswapPoolRewards');

const _1e18 = new BN('10').pow(new BN('18'));
const AMONTH = new BN('2629800'); // 1 month = 2629800 seconds

async function assertRevert(txPromise, message = undefined) {
    try {
      const tx = await txPromise
      // console.log("tx succeeded")
      assert.isFalse(tx.receipt.status) // when this assert fails, the expected revert didn't occur, i.e. the tx succeeded
    } catch (err) {
      // console.log("tx failed")
      assert.include(err.message, "revert")
      // TODO !!!
      
      // if (message) {
      //   assert.include(err.message, message)
      // }
    }
}

const almostEqualDiv1e18 = function (expectedOrig, actualOrig) {
  const expected = expectedOrig.div(_1e18);
  const actual = actualOrig.div(_1e18);
  this.assert(
    expected.eq(actual) ||
      expected.addn(1).eq(actual) || expected.addn(2).eq(actual) ||
      actual.addn(1).eq(expected) || actual.addn(2).eq(expected),
    'expected #{act} to be almost equal #{exp}',
    'expected #{act} to be different from #{exp}',
    expectedOrig.toString(),
    actualOrig.toString(),
  );
};

require('chai').use(function (chai, utils) {
  chai.Assertion.overwriteMethod('almostEqualDiv1e18', function (original) {
    return function (value) {
      if (utils.flag(this, 'bignumber')) {
        var expected = new BN(value);
        var actual = new BN(this._obj);
        almostEqualDiv1e18.apply(this, [expected, actual]);
      } else {
        original.apply(this, arguments);
      }
    };
  });
});

contract('UniswapPoolRewards', function ([_, wallet1, wallet2, wallet3, wallet4, owner]) {
  const deploy = async (that) => {
      that.uni = await ERC20Mock.new('Uniswap token', 'LPT', owner, 0);
      that.elimu = await ERC20Mock.new('ELIMU token', 'ELIMU', owner, 0);
      that.pool = await UniswapPoolRewards.new(that.elimu.address, that.uni.address, { from: owner });
      
      // TODO: read from contract
      that.rewardRate = await that.pool.rewardRate();

      // Mint and transfer elimu tokens.
      await that.elimu.mint(owner, web3.utils.toWei('10000000'));
      await that.elimu.approve(that.pool.address, new BN(2).pow(new BN(255)), { from: owner });

      await that.uni.mint(wallet1, web3.utils.toWei('1000'));
      await that.uni.mint(wallet2, web3.utils.toWei('1000'));
      await that.uni.mint(wallet3, web3.utils.toWei('1000'));
      await that.uni.mint(wallet4, web3.utils.toWei('1000'));

      await that.uni.approve(that.pool.address, new BN(2).pow(new BN(255)), { from: wallet1 });
      await that.uni.approve(that.pool.address, new BN(2).pow(new BN(255)), { from: wallet2 });
      await that.uni.approve(that.pool.address, new BN(2).pow(new BN(255)), { from: wallet3 });
      await that.uni.approve(that.pool.address, new BN(2).pow(new BN(255)), { from: wallet4 });
  };

  describe('UniswapPoolRewards', async function () {
    beforeEach(async function () {
      await deploy(this);
    });

    it('Two depositor with the same deposits wait a month', async function () {
      await this.pool.depositReward(web3.utils.toWei('10000000'), { from: owner });
      const owenerDepositTime = await time.latest();

      expect(await this.pool.rewardPerToken()).to.be.bignumber.almostEqualDiv1e18('0');
      expect(await this.pool.rewardsEarned(wallet1)).to.be.bignumber.equal('0');
      expect(await this.pool.rewardsEarned(wallet2)).to.be.bignumber.equal('0');
      expect(await this.pool.rewardBalance()).to.be.bignumber.equal(web3.utils.toWei('10000000'));
      const deposit1 = new BN(web3.utils.toWei('1'));
      await this.pool.deposit(deposit1, { from: wallet1, gas: 1000000 });
      const depositTime1 = await time.latest();

      // Time goes by... so slowly.
      await time.increaseTo(depositTime1.add(AMONTH.div(new BN(2)))); // Increase time by 2 weeks.

      const deposit2 = new BN(web3.utils.toWei('1'));
      await this.pool.deposit(deposit2, { from: wallet2, gas: 1000000 });
      const depositTime2 = await time.latest();


      const timeDiff = depositTime2.sub(depositTime1);
      const testTime = depositTime2.add(AMONTH.div(new BN(2))); // Increase time by a month.
      
      await time.increaseTo(testTime);
      
      var rewardPerToken = this.rewardRate.mul(timeDiff).mul(_1e18).div(deposit1);
      rewardPerToken = rewardPerToken.add(this.rewardRate.mul(testTime.sub(depositTime2)).mul(_1e18).div(deposit1.add(deposit2)));
      const rewardMustPaid = this.rewardRate.mul(AMONTH);
      const halfRewardMustPaid = rewardMustPaid.div(new BN("2"))
      const earnedDiff = halfRewardMustPaid.mul(timeDiff).div(AMONTH);

      expect(await this.pool.rewardPerToken()).to.be.bignumber.almostEqualDiv1e18(rewardPerToken);
      expect(await this.pool.rewardsEarned(wallet1)).to.be.bignumber.almostEqualDiv1e18(halfRewardMustPaid.add(earnedDiff));
      expect(await this.pool.rewardsEarned(wallet2)).to.be.bignumber.almostEqualDiv1e18(halfRewardMustPaid.sub(earnedDiff));
      console.log("------------------------------------------------------------------------");
      console.log("(calculated for a duration of one month)");
      console.log("rewardRate:", this.rewardRate.toString());
      console.log("rewardPerToken calc:", rewardPerToken.div(_1e18).toString());
      console.log("rewardPerToken actual:",(await this.pool.rewardPerToken()).div(_1e18).toString());
      console.log("------------------------------------------------------------------------"); 
      console.log("rewardsEarned wallet1:", (await this.pool.rewardsEarned(wallet1)).div(_1e18).toString());
      console.log("rewardsEarned wallet2:", (await this.pool.rewardsEarned(wallet2)).div(_1e18).toString());
      console.log("calculated reward wallet1:", halfRewardMustPaid.add(earnedDiff).div(_1e18).toString());
      console.log("calculated reward wallet2:", halfRewardMustPaid.sub(earnedDiff).div(_1e18).toString());
      console.log("------------------------------------------------------------------------");
      console.log("total reward must paid:", rewardMustPaid.div(_1e18).toString());
      console.log("earned diff:", earnedDiff.mul(new BN(2)).div(_1e18).toString());
      console.log("wallet2 deposit time difference from wallet1 (seconds):", timeDiff.toString());
      console.log("------------------------------------------------------------------------");
    });
});
});
