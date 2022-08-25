const { BN, time } = require('@openzeppelin/test-helpers');
const { expect, assert } = require('chai');


const ERC20Mock = artifacts.require('ERC20Mock');
const UniswapPoolRewards = artifacts.require('UniswapPoolRewards');

const _1e18 = new BN('10').pow(new BN('18'));
const ONE_MONTH = new BN('2629800'); // 1 month = 2629800 seconds
const ONE_DAY = new BN('86400'); // 1 day = 86400 seconds
const _1_000 = '1000';
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
      await that.elimu.transfer(that.pool.address, web3.utils.toWei(_10_000_000), { from: owner });

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
      expect(await this.pool.rewardPerPoolToken()).to.be.bignumber.almostEqualDiv1e18('0');
      expect(await this.pool.claimableReward(wallet1)).to.be.bignumber.equal('0');
      expect(await this.pool.claimableReward(wallet2)).to.be.bignumber.equal('0');
      const deposit1 = new BN(web3.utils.toWei('1'));
      await this.pool.depositPoolTokens(deposit1, { from: wallet1, gas: _1_000_000_GAS });
      const depositTime1 = await time.latest();

      // Time goes by... so slowly.
      await time.increaseTo(depositTime1.add(ONE_MONTH.div(new BN(2)))); // Increase time by 2 weeks.

      const deposit2 = new BN(web3.utils.toWei('1'));
      await this.pool.depositPoolTokens(deposit2, { from: wallet2, gas: _1_000_000_GAS });
      const depositTime2 = await time.latest();

      const timeDiff = depositTime2.sub(depositTime1);
      const testTime = depositTime2.add(ONE_MONTH.div(new BN(2))); // Increase time by a month.
      
      await time.increaseTo(testTime);
      
      var rewardPerPoolToken = this.rewardRatePerSecond.mul(timeDiff).mul(_1e18).div(deposit1);
      rewardPerPoolToken = rewardPerPoolToken.add(this.rewardRatePerSecond.mul(ONE_MONTH.sub(timeDiff)).mul(_1e18).div(deposit1.add(deposit2)));
      const rewardMustBePaid = this.rewardRatePerSecond.mul(ONE_MONTH);
      const halfRewardMustBePaid = rewardMustBePaid.div(new BN("2"))
      const rewardsEarnedDiff = halfRewardMustBePaid.mul(timeDiff).div(ONE_MONTH);

      expect(await this.pool.rewardPerPoolToken()).to.be.bignumber.almostEqualDiv1e18(rewardPerPoolToken);
      expect(await this.pool.claimableReward(wallet1)).to.be.bignumber.almostEqualDiv1e18(halfRewardMustBePaid.add(rewardsEarnedDiff));
      expect(await this.pool.claimableReward(wallet2)).to.be.bignumber.almostEqualDiv1e18(halfRewardMustBePaid.sub(rewardsEarnedDiff));
      console.log("------------------------------------------------------------------------");
      console.log("(calculated for a duration of one month)");
      console.log("rewardRatePerSecond:", convertToNumber(this.rewardRatePerSecond));
      console.log("rewardPerPoolToken calc:", convertToNumber(rewardPerPoolToken));
      console.log("rewardPerPoolToken actual:",convertToNumber(await this.pool.rewardPerPoolToken()));
      console.log("------------------------------------------------------------------------"); 
      console.log("rewardsEarned wallet1:", convertToNumber(await this.pool.claimableReward(wallet1)));
      console.log("rewardsEarned wallet2:", convertToNumber(await this.pool.claimableReward(wallet2)));
      console.log("calculated reward wallet1:", convertToNumber(halfRewardMustBePaid.add(rewardsEarnedDiff)));
      console.log("calculated reward wallet2:", convertToNumber(halfRewardMustBePaid.sub(rewardsEarnedDiff)));
      console.log("------------------------------------------------------------------------");
      console.log("total reward must paid:", convertToNumber(rewardMustBePaid));
      console.log("rewardsEarned diff:", convertToNumber(rewardsEarnedDiff.mul(new BN(2))));
      console.log("wallet2 deposit time difference from wallet1 (seconds):", timeDiff.toString());
      console.log("------------------------------------------------------------------------");
    });

    it('Two depositor with the different (1:3) deposits wait for a DURATION', async function () {
      expect(await this.pool.rewardPerPoolToken()).to.be.bignumber.almostEqualDiv1e18('0');
      expect(await this.pool.claimableReward(wallet1)).to.be.bignumber.equal('0');
      expect(await this.pool.claimableReward(wallet2)).to.be.bignumber.equal('0');
      const deposit1 = new BN(web3.utils.toWei('1'));
      await this.pool.depositPoolTokens(deposit1, { from: wallet1, gas: _1_000_000_GAS });
      const depositTime1 = await time.latest();

      // Time goes by... so slowly.
      await time.increaseTo(depositTime1.add(ONE_MONTH.div(new BN(2)))); // Increase time by 2 weeks.

      const deposit2 = new BN(web3.utils.toWei('3'));
      await this.pool.depositPoolTokens(deposit2, { from: wallet2, gas: _1_000_000_GAS });
      const depositTime2 = await time.latest();

      const timeDiff = depositTime2.sub(depositTime1);
      const testTime = depositTime2.add(ONE_MONTH.div(new BN(2))); // Increase time by a month.
      
      await time.increaseTo(testTime);
      
      const rewardPerPoolToken1 = this.rewardRatePerSecond.mul(timeDiff).mul(_1e18).div(deposit1);
      const rewardPerPoolToken2 = this.rewardRatePerSecond.mul(testTime.sub(depositTime2)).mul(_1e18).div(deposit1.add(deposit2));
      const rewardPerPoolToken = rewardPerPoolToken1.add(rewardPerPoolToken2);

      expect(await this.pool.rewardPerPoolToken()).to.be.bignumber.almostEqualDiv1e18(rewardPerPoolToken);
      expect(await this.pool.claimableReward(wallet1)).to.be.bignumber.almostEqualDiv1e18(rewardPerPoolToken1.add(rewardPerPoolToken2).mul(deposit1).div(_1e18));
      expect(await this.pool.claimableReward(wallet2)).to.be.bignumber.almostEqualDiv1e18(rewardPerPoolToken2.mul(deposit2).div(_1e18));
      console.log("------------------------------------------------------------------------");
      console.log("(calculated for a duration of one month)");
      console.log("rewardRatePerSecond:", convertToNumber(this.rewardRatePerSecond));
      console.log("rewardPerPoolToken calc:", convertToNumber(rewardPerPoolToken));
      console.log("rewardPerPoolToken actual:",convertToNumber(await this.pool.rewardPerPoolToken()));
      console.log("------------------------------------------------------------------------"); 
      console.log("rewardsEarned wallet1:", convertToNumber(await this.pool.claimableReward(wallet1)));
      console.log("rewardsEarned wallet2:", convertToNumber(await this.pool.claimableReward(wallet2)));
      console.log("------------------------------------------------------------------------");
    });

    it('Two depositors with different (1:3) deposits wait for DURATION and DURATION/2', async function () {
      //
      // 1x: +--------------+
      // 3x:      +---------+
      //

      const deposit1 = new BN(web3.utils.toWei('1'));
      await this.pool.depositPoolTokens(deposit1, { from: wallet1 });
      const depositTime1 = await time.latest();

      await time.increaseTo(depositTime1.add(ONE_MONTH.div(new BN(3))));

      const deposit2 = new BN(web3.utils.toWei('3'));
      await this.pool.depositPoolTokens(deposit2, { from: wallet2 });
      const depositTime2 = await time.latest();

      const timeDiff = depositTime2.sub(depositTime1);
      const rewardPerPoolToken1 = this.rewardRatePerSecond.mul(timeDiff).mul(_1e18).div(deposit1);
      expect(await this.pool.rewardPerPoolToken()).to.be.bignumber.almostEqualDiv1e18(rewardPerPoolToken1);
      expect(await this.pool.claimableReward(wallet1)).to.be.bignumber.almostEqualDiv1e18(rewardPerPoolToken1.mul(deposit1).div(_1e18));
      expect(await this.pool.claimableReward(wallet2)).to.be.bignumber.equal('0');

      // Forward to week 3 and notifyReward weekly
      await time.increase(ONE_MONTH.mul(new BN(2)).div(new BN(3)));

      const rewardPerPoolToken2 = this.rewardRatePerSecond.mul(ONE_MONTH.sub(timeDiff)).mul(_1e18).div(deposit1.add(deposit2));
      const rewardPerPoolToken = rewardPerPoolToken1.add(rewardPerPoolToken2);
      expect(await this.pool.rewardPerPoolToken()).to.be.bignumber.almostEqualDiv1e18(rewardPerPoolToken);
      expect(await this.pool.claimableReward(wallet1)).to.be.bignumber.almostEqualDiv1e18(rewardPerPoolToken1.add(rewardPerPoolToken2).mul(deposit1).div(_1e18));
      expect(await this.pool.claimableReward(wallet2)).to.be.bignumber.almostEqualDiv1e18(rewardPerPoolToken2.mul(deposit2).div(_1e18));
      console.log("------------------------------------------------------------------------");
      console.log("(calculated for a duration of one month)");
      console.log("rewardRatePerSecond:", convertToNumber(this.rewardRatePerSecond));
      console.log("rewardPerPoolToken calc:", convertToNumber(rewardPerPoolToken));
      console.log("rewardPerPoolToken actual:",convertToNumber(await this.pool.rewardPerPoolToken()));
      console.log("------------------------------------------------------------------------"); 
      console.log("rewardsEarned wallet1:", convertToNumber(await this.pool.claimableReward(wallet1)));
      console.log("rewardsEarned wallet2:", convertToNumber(await this.pool.claimableReward(wallet2)));
      console.log("------------------------------------------------------------------------");
    });

    it('Three depositors with different (1:3:5) deposits waits for different DURATION', async function () {
      //
      // 1x: +----------------+--------+
      // 3x:  +---------------+
      // 5x:         +-----------------+
      //

      const deposit1 = new BN(web3.utils.toWei('1'));
      await this.pool.depositPoolTokens(deposit1, { from: wallet1, gas: _1_000_000_GAS});
      const depositTime1 = await time.latest();


      const deposit2 = new BN(web3.utils.toWei('3'));
      await this.pool.depositPoolTokens(deposit2, { from: wallet2, gas: _1_000_000_GAS });
      const depositTime2 = await time.latest();

      await time.increaseTo(depositTime1.add(ONE_MONTH.div(new BN(3))));

      const deposit3 = new BN(web3.utils.toWei('5'));
      await this.pool.depositPoolTokens(deposit3, { from: wallet3, gas: _1_000_000_GAS });
      const depositTime3 = await time.latest();

      const timeDiff1 = depositTime2.sub(depositTime1);
      const timeDiff2 = depositTime3.sub(depositTime2);
      const rewardPerPoolToken1 = this.rewardRatePerSecond.mul(timeDiff1).mul(_1e18).div(deposit1);
      const rewardPerPoolToken2 = this.rewardRatePerSecond.mul(timeDiff2).mul(_1e18).div(deposit1.add(deposit2));
      expect(await this.pool.rewardPerPoolToken()).to.be.bignumber.almostEqualDiv1e18(rewardPerPoolToken1.add(rewardPerPoolToken2));
      expect(await this.pool.claimableReward(wallet1)).to.be.bignumber.almostEqualDiv1e18(rewardPerPoolToken1.add(rewardPerPoolToken2).mul(deposit1).div(_1e18));
      expect(await this.pool.claimableReward(wallet2)).to.be.bignumber.almostEqualDiv1e18(rewardPerPoolToken2.mul(deposit2).div(_1e18));

      await time.increaseTo(depositTime1.add(ONE_MONTH.mul(new BN(2)).div(new BN(3))));

      await this.pool.withdrawPoolTokensAndClaimReward({ from: wallet2, gas: _1_000_000_GAS });
      const exitTime2 = await time.latest();

      const timeDiff3 = exitTime2.sub(depositTime3);
      const rewardPerPoolToken3 = this.rewardRatePerSecond.mul(timeDiff3).mul(_1e18).div(deposit1.add(deposit2).add(deposit3));
      expect(await this.pool.rewardPerPoolToken()).to.be.bignumber.almostEqualDiv1e18(rewardPerPoolToken1.add(rewardPerPoolToken2).add(rewardPerPoolToken3));
      expect(await this.pool.claimableReward(wallet1)).to.be.bignumber.almostEqualDiv1e18(rewardPerPoolToken1.add(rewardPerPoolToken2).add(rewardPerPoolToken3).mul(deposit1).div(_1e18));
      expect(await this.pool.claimableReward(wallet2)).to.be.bignumber.equal('0');
      expect(await this.elimu.balanceOf(wallet2)).to.be.bignumber.almostEqualDiv1e18(rewardPerPoolToken2.add(rewardPerPoolToken3).mul(deposit2).div(_1e18));
      expect(await this.pool.claimableReward(wallet3)).to.be.bignumber.almostEqualDiv1e18(rewardPerPoolToken3.mul(deposit3).div(_1e18));

      await time.increaseTo(depositTime1.add(ONE_MONTH));

      const timeDiff4 = ONE_MONTH.sub(exitTime2.sub(depositTime1));
      const rewardPerPoolToken4 = this.rewardRatePerSecond.mul(timeDiff4).mul(_1e18).div(deposit1.add(deposit3));
      const rewardPerPoolToken = rewardPerPoolToken1.add(rewardPerPoolToken2).add(rewardPerPoolToken3).add(rewardPerPoolToken4)
      expect(await this.pool.rewardPerPoolToken()).to.be.bignumber.almostEqualDiv1e18(rewardPerPoolToken);
      expect(await this.pool.claimableReward(wallet1)).to.be.bignumber.almostEqualDiv1e18(rewardPerPoolToken.mul(deposit1).div(_1e18));
      expect(await this.pool.claimableReward(wallet2)).to.be.bignumber.equal('0');
      expect(await this.pool.claimableReward(wallet3)).to.be.bignumber.almostEqualDiv1e18(rewardPerPoolToken3.add(rewardPerPoolToken4).mul(deposit3).div(_1e18));
      console.log("------------------------------------------------------------------------");
      console.log("(calculated for a duration of one month)");
      console.log("rewardRatePerSecond:", convertToNumber(this.rewardRatePerSecond));
      console.log("rewardPerPoolToken calc:", convertToNumber(rewardPerPoolToken));
      console.log("rewardPerPoolToken actual:",convertToNumber(await this.pool.rewardPerPoolToken()));
      console.log("------------------------------------------------------------------------"); 
      console.log("rewardsEarned wallet1:", convertToNumber(await this.pool.claimableReward(wallet1)));
      console.log("rewardsEarned wallet2:", convertToNumber(await this.pool.claimableReward(wallet2)));
      console.log("rewardsEarned wallet3:", convertToNumber(await this.pool.claimableReward(wallet3)));
      console.log("------------------------------------------------------------------------");
    });

    it('Adjusting the reward rate for two depositor with the different (1:3) deposits', async function () {
      expect(await this.pool.rewardPerPoolToken()).to.be.bignumber.almostEqualDiv1e18('0');
      expect(await this.pool.claimableReward(wallet1)).to.be.bignumber.equal('0');
      expect(await this.pool.claimableReward(wallet2)).to.be.bignumber.equal('0');

      // Setting rewardRatePerSecond to 1 token per second (86,400 tokens per day).
      await this.pool.setRewardRatePerSecond(web3.utils.toWei("1") ,{from: owner})

      const deposit1 = new BN(web3.utils.toWei('1'));
      await this.pool.depositPoolTokens(deposit1, { from: wallet1, gas: _1_000_000_GAS });
      const depositTime1 = await time.latest();

      const deposit2 = new BN(web3.utils.toWei('3'));
      await this.pool.depositPoolTokens(deposit2, { from: wallet2, gas: _1_000_000_GAS });
      const depositTime2 = await time.latest();

      // Time goes by... so slowly.
      await time.increaseTo(depositTime1.add(ONE_DAY)); // Increase time by 2 weeks.
      const rewardRatePerSecondBefore = await this.pool.rewardRatePerSecond();

      console.log("------------------------------------------------------------------------"); 
      console.log("rewardRatePerSecond (after 1 day):", convertToNumber(rewardRatePerSecondBefore));
      console.log("rewardPerPoolToken:",convertToNumber(await this.pool.rewardPerPoolToken()));

      // Set rewardRatePerSecond to 0.5 token per second (86,400 tokens per day).
      await this.pool.setRewardRatePerSecond(web3.utils.toWei("0.5") ,{from: owner})
      const adjustTime = await time.latest();
      const rewardEarnedWallet1Before = await this.pool.claimableReward(wallet1);
      const rewardEarnedWallet2Before = await this.pool.claimableReward(wallet2);
      console.log("rewardsEarned wallet1:", convertToNumber(rewardEarnedWallet1Before));
      console.log("rewardsEarned wallet2:", convertToNumber(rewardEarnedWallet2Before));

      const deposit3 = new BN(web3.utils.toWei('1'));
      await this.pool.depositPoolTokens(deposit3, { from: wallet1, gas: _1_000_000_GAS });
      const depositTime3 = await time.latest();

      const deposit4 = new BN(web3.utils.toWei('3'));
      await this.pool.depositPoolTokens(deposit4, { from: wallet2, gas: _1_000_000_GAS });
      const depositTime4 = await time.latest();
      console.log("------------------------------------------------------------------------"); 
      console.log("rewardPerPoolToken (after the second deposits):", convertToNumber(await this.pool.rewardPerPoolToken()));
      console.log("rewardsEarned wallet1:", convertToNumber(await this.pool.claimableReward(wallet1)));
      console.log("rewardsEarned wallet2:", convertToNumber(await this.pool.claimableReward(wallet2)));

      // Increase time by a day.
      const testTime = depositTime1.add(ONE_DAY.mul(new BN("2"))); 
      await time.increaseTo(testTime);
      const rewardEarnedWallet1After = await this.pool.claimableReward(wallet1);
      const rewardEarnedWallet2After = await this.pool.claimableReward(wallet2);
      const rewardRatePerSecondAfter = await this.pool.rewardRatePerSecond();
      console.log("------------------------------------------------------------------------"); 
      console.log("rewardRatePerSecond (after one 2):", convertToNumber(rewardRatePerSecondAfter));
      console.log("rewardPerPoolToken:",convertToNumber(await this.pool.rewardPerPoolToken()));
      console.log("rewardsEarned wallet1:", convertToNumber(rewardEarnedWallet1After));
      console.log("rewardsEarned wallet2:", convertToNumber(rewardEarnedWallet2After));

      
      const rewardPerPoolToken1 = rewardRatePerSecondBefore.mul(depositTime2.sub(depositTime1)).mul(_1e18).div(deposit1);
      const rewardPerPoolToken2 = rewardRatePerSecondBefore.mul(adjustTime.sub(depositTime2)).mul(_1e18).div(deposit1.add(deposit2));
      const rewardPerPoolToken3 = rewardRatePerSecondBefore.mul(depositTime3.sub(adjustTime)).mul(_1e18).div(deposit1.add(deposit2));
      const rewardPerPoolToken4 = rewardRatePerSecondBefore.mul(depositTime4.sub(depositTime3)).mul(_1e18).div(deposit1.add(deposit2).add(deposit3));
      const rewardPerPoolToken5 = rewardRatePerSecondAfter.mul(testTime.sub(depositTime4)).mul(_1e18).div(deposit1.add(deposit2).add(deposit3).add(deposit4));
      const rewardPerPoolToken = rewardPerPoolToken1.add(rewardPerPoolToken2).add(rewardPerPoolToken3).add(rewardPerPoolToken4).add(rewardPerPoolToken5);

      expect(await this.pool.rewardPerPoolToken()).to.be.bignumber.almostEqualDiv1e18(rewardPerPoolToken);
      expect(rewardEarnedWallet1Before).to.be.bignumber.almostEqualDiv1e18(rewardPerPoolToken1.add(rewardPerPoolToken2).mul(deposit1).div(_1e18));
      expect(rewardEarnedWallet2Before).to.be.bignumber.almostEqualDiv1e18(rewardPerPoolToken2.mul(deposit2).div(_1e18));
      expect(rewardEarnedWallet1After).to.be.bignumber.almostEqualDiv1e18(rewardEarnedWallet1Before.add(rewardPerPoolToken3.add(rewardPerPoolToken4).add(rewardPerPoolToken5).mul(deposit1.add(deposit3)).div(_1e18)));
      expect(rewardEarnedWallet2After).to.be.bignumber.almostEqualDiv1e18(rewardEarnedWallet2Before.add(rewardPerPoolToken3.add(rewardPerPoolToken4).add(rewardPerPoolToken5).mul(deposit2.add(deposit4)).div(_1e18)));

      console.log("------------------------------------------------------------------------");
      console.log("(calculated for a duration of one day)");
      console.log("rewardPerPoolToken calc:", convertToNumber(rewardPerPoolToken));
      console.log("rewardPerPoolToken actual:",convertToNumber(await this.pool.rewardPerPoolToken()));
      console.log("------------------------------------------------------------------------"); 
    });


    it.only('Reward program is ended by the owner', async function () {
      expect(await this.pool.rewardPerPoolToken()).to.be.bignumber.almostEqualDiv1e18('0');
      expect(await this.pool.claimableReward(wallet1)).to.be.bignumber.equal('0');
      const deposit1 = new BN(web3.utils.toWei('1'));
      await this.pool.depositPoolTokens(deposit1, { from: wallet1, gas: _1_000_000_GAS });
      const depositTime1 = await time.latest();

      await time.increaseTo(depositTime1.add(ONE_MONTH.div(new BN(2)))); // Increase time by 2 weeks.
      const rewardEarned1 = await this.pool.claimableReward(wallet1);

      // Ending the program.
      await this.pool.setRewardRatePerSecond(new BN("0") ,{from: owner})
      const endTime = await time.latest();

      // Time goes by... so slowly.
      await time.increaseTo(depositTime1.add(ONE_MONTH)); // Increase time by 2 weeks.
      const rewardEarned2 = await this.pool.claimableReward(wallet1);
      const testTime = await time.latest();

      try {
        const deposit2 = new BN(web3.utils.toWei('1'));
        await this.pool.depositPoolTokens(deposit1, { from: wallet1, gas: _1_000_000_GAS });
      } catch(e) {
        expect(e.reason).to.be.equal("the reward program is currently ended");
      }

      const timeDiff = endTime.sub(depositTime1);

      const rewardPerPoolToken1 = this.rewardRatePerSecond.mul(timeDiff).mul(_1e18).div(deposit1);
      const rewardPerPoolToken2 = new BN("0")
      const rewardPerPoolToken = rewardPerPoolToken1.add(rewardPerPoolToken2);

      expect(await this.pool.rewardPerPoolToken()).to.be.bignumber.almostEqualDiv1e18(rewardPerPoolToken);
      expect(rewardEarned1).to.be.bignumber.almostEqualDiv1e18(rewardPerPoolToken);
      expect(await this.pool.claimableReward(wallet1)).to.be.bignumber.almostEqualDiv1e18(rewardEarned1);
      expect(rewardEarned2).to.be.bignumber.almostEqualDiv1e18(rewardEarned1);
      expect(rewardPerPoolToken1).to.be.bignumber.almostEqualDiv1e18(rewardPerPoolToken);
      expect(await this.pool.rewardRatePerSecond()).to.be.bignumber.almostEqualDiv1e18(new BN("0"));
      console.log("------------------------------------------------------------------------");
      console.log("(calculated for a duration of one month)");
      console.log("rewardRatePerSecond:", convertToNumber(await this.pool.rewardRatePerSecond()));
      console.log("rewardPerPoolToken calc:", convertToNumber(rewardPerPoolToken));
      console.log("rewardPerPoolToken actual:",convertToNumber(await this.pool.rewardPerPoolToken()));
      console.log("------------------------------------------------------------------------"); 
      console.log("claimableReward at the moment of endProgram method called:", convertToNumber(rewardEarned1));
      console.log("claimableReward 2 weeks after ending the program:", convertToNumber(rewardEarned2));
      console.log("------------------------------------------------------------------------");
    });
});
});
