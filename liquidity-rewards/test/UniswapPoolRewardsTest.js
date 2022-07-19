const { BN, time } = require('@openzeppelin/test-helpers');
const { expect, assert } = require('chai');


const ERC20Mock = artifacts.require('ERC20Mock');
const UniswapPoolRewards = artifacts.require('UniswapPoolRewards');

const _1e18 = new BN('10').pow(new BN('18'));
const ONE_MONTH = new BN('2629800'); // 1 month = 2629800 seconds
const _1_000 = '10000';
const _10_000_000 = '10000000';
const _1_000_000_GAS = 1000000;

function convertToNumber(bn){
  return web3.utils.fromWei(bn.toString(), 'ether');
}

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
      that.uni = await ERC20Mock.new('Uniswap V2', 'UNI-V2', owner, 0);
      that.elimu = await ERC20Mock.new('elimu.ai', 'ELIMU', owner, 0);
      that.pool = await UniswapPoolRewards.new(that.elimu.address, that.uni.address, { from: owner });
      that.rewardRatePerSecond = await that.pool.rewardRatePerSecond();

      // Mint and transfer elimu tokens.
      await that.elimu.mint(owner, web3.utils.toWei(_10_000_000));
      await that.elimu.approve(that.pool.address, new BN(2).pow(new BN(255)), { from: owner });
      await that.pool.depositReward(web3.utils.toWei(_10_000_000), { from: owner });

      await that.uni.mint(wallet1, web3.utils.toWei(_1_000));
      await that.uni.mint(wallet2, web3.utils.toWei(_1_000));
      await that.uni.mint(wallet3, web3.utils.toWei(_1_000));
      await that.uni.mint(wallet4, web3.utils.toWei(_1_000));

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
      expect(await this.pool.rewardPerToken()).to.be.bignumber.almostEqualDiv1e18('0');
      expect(await this.pool.rewardsEarned(wallet1)).to.be.bignumber.equal('0');
      expect(await this.pool.rewardsEarned(wallet2)).to.be.bignumber.equal('0');
      expect(await this.pool.rewardBalance()).to.be.bignumber.equal(web3.utils.toWei(_10_000_000));
      const deposit1 = new BN(web3.utils.toWei('1'));
      await this.pool.deposit(deposit1, { from: wallet1, gas: _1_000_000_GAS });
      const depositTime1 = await time.latest();

      // Time goes by... so slowly.
      await time.increaseTo(depositTime1.add(ONE_MONTH.div(new BN(2)))); // Increase time by 2 weeks.

      const deposit2 = new BN(web3.utils.toWei('1'));
      await this.pool.deposit(deposit2, { from: wallet2, gas: _1_000_000_GAS });
      const depositTime2 = await time.latest();

      const timeDiff = depositTime2.sub(depositTime1);
      const testTime = depositTime2.add(ONE_MONTH.div(new BN(2))); // Increase time by a month.
      
      await time.increaseTo(testTime);
      
      var rewardPerToken = this.rewardRatePerSecond.mul(timeDiff).mul(_1e18).div(deposit1);
      rewardPerToken = rewardPerToken.add(this.rewardRatePerSecond.mul(ONE_MONTH.sub(timeDiff)).mul(_1e18).div(deposit1.add(deposit2)));
      const rewardMustBePaid = this.rewardRatePerSecond.mul(ONE_MONTH);
      const halfRewardMustBePaid = rewardMustBePaid.div(new BN("2"))
      const rewardsEarnedDiff = halfRewardMustBePaid.mul(timeDiff).div(ONE_MONTH);

      expect(await this.pool.rewardPerToken()).to.be.bignumber.almostEqualDiv1e18(rewardPerToken);
      expect(await this.pool.rewardsEarned(wallet1)).to.be.bignumber.almostEqualDiv1e18(halfRewardMustBePaid.add(rewardsEarnedDiff));
      expect(await this.pool.rewardsEarned(wallet2)).to.be.bignumber.almostEqualDiv1e18(halfRewardMustBePaid.sub(rewardsEarnedDiff));
      console.log("------------------------------------------------------------------------");
      console.log("(calculated for a duration of one month)");
      console.log("rewardRatePerSecond:", convertToNumber(this.rewardRatePerSecond));
      console.log("rewardPerToken calc:", convertToNumber(rewardPerToken));
      console.log("rewardPerToken actual:",convertToNumber(await this.pool.rewardPerToken()));
      console.log("------------------------------------------------------------------------"); 
      console.log("rewardsEarned wallet1:", convertToNumber(await this.pool.rewardsEarned(wallet1)));
      console.log("rewardsEarned wallet2:", convertToNumber(await this.pool.rewardsEarned(wallet2)));
      console.log("calculated reward wallet1:", convertToNumber(halfRewardMustBePaid.add(rewardsEarnedDiff)));
      console.log("calculated reward wallet2:", convertToNumber(halfRewardMustBePaid.sub(rewardsEarnedDiff)));
      console.log("------------------------------------------------------------------------");
      console.log("total reward must paid:", convertToNumber(rewardMustBePaid));
      console.log("rewardsEarned diff:", convertToNumber(rewardsEarnedDiff.mul(new BN(2))));
      console.log("wallet2 deposit time difference from wallet1 (seconds):", timeDiff.toString());
      console.log("------------------------------------------------------------------------");
    });

    it('Two depositor with the different (1:3) deposits wait for a DURATION', async function () {
      expect(await this.pool.rewardPerToken()).to.be.bignumber.almostEqualDiv1e18('0');
      expect(await this.pool.rewardsEarned(wallet1)).to.be.bignumber.equal('0');
      expect(await this.pool.rewardsEarned(wallet2)).to.be.bignumber.equal('0');
      const deposit1 = new BN(web3.utils.toWei('1'));
      await this.pool.deposit(deposit1, { from: wallet1, gas: _1_000_000_GAS });
      const depositTime1 = await time.latest();

      // Time goes by... so slowly.
      await time.increaseTo(depositTime1.add(ONE_MONTH.div(new BN(2)))); // Increase time by 2 weeks.

      const deposit2 = new BN(web3.utils.toWei('3'));
      await this.pool.deposit(deposit2, { from: wallet2, gas: _1_000_000_GAS });
      const depositTime2 = await time.latest();

      const timeDiff = depositTime2.sub(depositTime1);
      const testTime = depositTime2.add(ONE_MONTH.div(new BN(2))); // Increase time by a month.
      
      await time.increaseTo(testTime);
      
      const rewardPerToken1 = this.rewardRatePerSecond.mul(timeDiff).mul(_1e18).div(deposit1);
      const rewardPerToken2 = this.rewardRatePerSecond.mul(testTime.sub(depositTime2)).mul(_1e18).div(deposit1.add(deposit2));
      const rewardPerToken = rewardPerToken1.add(rewardPerToken2);

      expect(await this.pool.rewardPerToken()).to.be.bignumber.almostEqualDiv1e18(rewardPerToken);
      expect(await this.pool.rewardsEarned(wallet1)).to.be.bignumber.almostEqualDiv1e18(rewardPerToken1.add(rewardPerToken2).mul(deposit1).div(_1e18));
      expect(await this.pool.rewardsEarned(wallet2)).to.be.bignumber.almostEqualDiv1e18(rewardPerToken2.mul(deposit2).div(_1e18));
      console.log("------------------------------------------------------------------------");
      console.log("(calculated for a duration of one month)");
      console.log("rewardRatePerSecond:", convertToNumber(this.rewardRatePerSecond));
      console.log("rewardPerToken calc:", convertToNumber(rewardPerToken));
      console.log("rewardPerToken actual:",convertToNumber(await this.pool.rewardPerToken()));
      console.log("------------------------------------------------------------------------"); 
      console.log("rewardsEarned wallet1:", convertToNumber(await this.pool.rewardsEarned(wallet1)));
      console.log("rewardsEarned wallet2:", convertToNumber(await this.pool.rewardsEarned(wallet2)));
      console.log("------------------------------------------------------------------------");
    });

    it('Two depositors with different (1:3) deposits wait for DURATION and DURATION/2', async function () {
      //
      // 1x: +--------------+
      // 3x:      +---------+
      //

      const deposit1 = new BN(web3.utils.toWei('1'));
      await this.pool.deposit(deposit1, { from: wallet1 });
      const depositTime1 = await time.latest();

      await time.increaseTo(depositTime1.add(ONE_MONTH.div(new BN(3))));

      const deposit2 = new BN(web3.utils.toWei('3'));
      await this.pool.deposit(deposit2, { from: wallet2 });
      const depositTime2 = await time.latest();

      const timeDiff = depositTime2.sub(depositTime1);
      const rewardPerToken1 = this.rewardRatePerSecond.mul(timeDiff).mul(_1e18).div(deposit1);
      expect(await this.pool.rewardPerToken()).to.be.bignumber.almostEqualDiv1e18(rewardPerToken1);
      expect(await this.pool.rewardsEarned(wallet1)).to.be.bignumber.almostEqualDiv1e18(rewardPerToken1.mul(deposit1).div(_1e18));
      expect(await this.pool.rewardsEarned(wallet2)).to.be.bignumber.equal('0');

      // Forward to week 3 and notifyReward weekly
      await time.increase(ONE_MONTH.mul(new BN(2)).div(new BN(3)));

      const rewardPerToken2 = this.rewardRatePerSecond.mul(ONE_MONTH.sub(timeDiff)).mul(_1e18).div(deposit1.add(deposit2));
      const rewardPerToken = rewardPerToken1.add(rewardPerToken2);
      expect(await this.pool.rewardPerToken()).to.be.bignumber.almostEqualDiv1e18(rewardPerToken);
      expect(await this.pool.rewardsEarned(wallet1)).to.be.bignumber.almostEqualDiv1e18(rewardPerToken1.add(rewardPerToken2).mul(deposit1).div(_1e18));
      expect(await this.pool.rewardsEarned(wallet2)).to.be.bignumber.almostEqualDiv1e18(rewardPerToken2.mul(deposit2).div(_1e18));
      console.log("------------------------------------------------------------------------");
      console.log("(calculated for a duration of one month)");
      console.log("rewardRatePerSecond:", convertToNumber(this.rewardRatePerSecond));
      console.log("rewardPerToken calc:", convertToNumber(rewardPerToken));
      console.log("rewardPerToken actual:",convertToNumber(await this.pool.rewardPerToken()));
      console.log("------------------------------------------------------------------------"); 
      console.log("rewardsEarned wallet1:", convertToNumber(await this.pool.rewardsEarned(wallet1)));
      console.log("rewardsEarned wallet2:", convertToNumber(await this.pool.rewardsEarned(wallet2)));
      console.log("------------------------------------------------------------------------");
    });

    it('Three depositors with different (1:3:5) deposits waits for different DURATION', async function () {
      //
      // 1x: +----------------+--------+
      // 3x:  +---------------+
      // 5x:         +-----------------+
      //

      const deposit1 = new BN(web3.utils.toWei('1'));
      await this.pool.deposit(deposit1, { from: wallet1, gas: _1_000_000_GAS});
      const depositTime1 = await time.latest();


      const deposit2 = new BN(web3.utils.toWei('3'));
      await this.pool.deposit(deposit2, { from: wallet2, gas: _1_000_000_GAS });
      const depositTime2 = await time.latest();

      await time.increaseTo(depositTime1.add(ONE_MONTH.div(new BN(3))));

      const deposit3 = new BN(web3.utils.toWei('5'));
      await this.pool.deposit(deposit3, { from: wallet3, gas: _1_000_000_GAS });
      const depositTime3 = await time.latest();

      const timeDiff1 = depositTime2.sub(depositTime1);
      const timeDiff2 = depositTime3.sub(depositTime2);
      const rewardPerToken1 = this.rewardRatePerSecond.mul(timeDiff1).mul(_1e18).div(deposit1);
      const rewardPerToken2 = this.rewardRatePerSecond.mul(timeDiff2).mul(_1e18).div(deposit1.add(deposit2));
      expect(await this.pool.rewardPerToken()).to.be.bignumber.almostEqualDiv1e18(rewardPerToken1.add(rewardPerToken2));
      expect(await this.pool.rewardsEarned(wallet1)).to.be.bignumber.almostEqualDiv1e18(rewardPerToken1.add(rewardPerToken2).mul(deposit1).div(_1e18));
      expect(await this.pool.rewardsEarned(wallet2)).to.be.bignumber.almostEqualDiv1e18(rewardPerToken2.mul(deposit2).div(_1e18));

      await time.increaseTo(depositTime1.add(ONE_MONTH.mul(new BN(2)).div(new BN(3))));

      await this.pool.withdrawAndClaim({ from: wallet2, gas: _1_000_000_GAS });
      const exitTime2 = await time.latest();

      const timeDiff3 = exitTime2.sub(depositTime3);
      const rewardPerToken3 = this.rewardRatePerSecond.mul(timeDiff3).mul(_1e18).div(deposit1.add(deposit2).add(deposit3));
      expect(await this.pool.rewardPerToken()).to.be.bignumber.almostEqualDiv1e18(rewardPerToken1.add(rewardPerToken2).add(rewardPerToken3));
      expect(await this.pool.rewardsEarned(wallet1)).to.be.bignumber.almostEqualDiv1e18(rewardPerToken1.add(rewardPerToken2).add(rewardPerToken3).mul(deposit1).div(_1e18));
      expect(await this.pool.rewardsEarned(wallet2)).to.be.bignumber.equal('0');
      expect(await this.elimu.balanceOf(wallet2)).to.be.bignumber.almostEqualDiv1e18(rewardPerToken2.add(rewardPerToken3).mul(deposit2).div(_1e18));
      expect(await this.pool.rewardsEarned(wallet3)).to.be.bignumber.almostEqualDiv1e18(rewardPerToken3.mul(deposit3).div(_1e18));

      await time.increaseTo(depositTime1.add(ONE_MONTH));

      const timeDiff4 = ONE_MONTH.sub(exitTime2.sub(depositTime1));
      const rewardPerToken4 = this.rewardRatePerSecond.mul(timeDiff4).mul(_1e18).div(deposit1.add(deposit3));
      const rewardPerToken = rewardPerToken1.add(rewardPerToken2).add(rewardPerToken3).add(rewardPerToken4)
      expect(await this.pool.rewardPerToken()).to.be.bignumber.almostEqualDiv1e18(rewardPerToken);
      expect(await this.pool.rewardsEarned(wallet1)).to.be.bignumber.almostEqualDiv1e18(rewardPerToken.mul(deposit1).div(_1e18));
      expect(await this.pool.rewardsEarned(wallet2)).to.be.bignumber.equal('0');
      expect(await this.pool.rewardsEarned(wallet3)).to.be.bignumber.almostEqualDiv1e18(rewardPerToken3.add(rewardPerToken4).mul(deposit3).div(_1e18));
      console.log("------------------------------------------------------------------------");
      console.log("(calculated for a duration of one month)");
      console.log("rewardRatePerSecond:", convertToNumber(this.rewardRatePerSecond));
      console.log("rewardPerToken calc:", convertToNumber(rewardPerToken));
      console.log("rewardPerToken actual:",convertToNumber(await this.pool.rewardPerToken()));
      console.log("------------------------------------------------------------------------"); 
      console.log("rewardsEarned wallet1:", convertToNumber(await this.pool.rewardsEarned(wallet1)));
      console.log("rewardsEarned wallet2:", convertToNumber(await this.pool.rewardsEarned(wallet2)));
      console.log("rewardsEarned wallet3:", convertToNumber(await this.pool.rewardsEarned(wallet3)));
      console.log("------------------------------------------------------------------------");
    });
});
});
