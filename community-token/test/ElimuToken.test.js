const keccak256 = web3.utils.keccak256;
const { expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');

const ElimuToken = artifacts.require('ElimuToken');

require('chai').should();

contract('ElimuToken', accounts => {

    console.log('accounts: ' + accounts);

    const MINTER_ROLE = keccak256("MINTER_ROLE");

    beforeEach(async function() {
        this.contract = await ElimuToken.deployed();
    });

    it('deployed successfully', async function() {
        const address = await this.contract.address;
        assert.notEqual(address, 0x0);
        assert.notEqual(address, "");
        assert.notEqual(address, null);
        assert.notEqual(address, undefined);
    });

    it('max total supply for timestamp', async function() {
        let date;
        let maxTotalSupply;

        // 1 day before start time
        date = new Date('2021-06-30 00:00:00 UTC');
        maxTotalSupply = await this.contract.getMaxTotalSupplyForTimestamp(date.getTime() / 1_000);
        maxTotalSupply.toString().should.equal("38700000000000000000000000"); // 38,700,000

        // 1 hour before start time
        date = new Date('2021-06-30 23:00:00 UTC');
        maxTotalSupply = await this.contract.getMaxTotalSupplyForTimestamp(date.getTime() / 1_000);
        maxTotalSupply.toString().should.equal("38700000000000000000000000"); // 38,700,000

        // Start time
        date = new Date('2021-07-01 00:00:00 UTC');
        maxTotalSupply = await this.contract.getMaxTotalSupplyForTimestamp(date.getTime() / 1_000);
        maxTotalSupply.toString().should.equal("38700000000000000000000000"); // 38,700,000

        // 1 hour after start time
        date = new Date('2021-07-01 01:00:00 UTC');
        maxTotalSupply = await this.contract.getMaxTotalSupplyForTimestamp(date.getTime() / 1_000);
        maxTotalSupply.toString().should.equal("38704417808219178082191780"); // 38,700,000 + (38,700,000 / 365 / 24)

        // 1 day after start time
        date = new Date('2021-07-02 00:00:00 UTC');
        maxTotalSupply = await this.contract.getMaxTotalSupplyForTimestamp(date.getTime() / 1_000);
        maxTotalSupply.toString().should.equal("38806027397260273972602739"); // 38,700,000 + (38,700,000 / 365)

        // 1 year after start time
        date = new Date('2022-07-01 00:00:00 UTC');
        maxTotalSupply = await this.contract.getMaxTotalSupplyForTimestamp(date.getTime() / 1_000);
        maxTotalSupply.toString().should.equal("77400000000000000000000000"); // 38,700,000 + 38,700,000

        // 2 years after start time
        date = new Date('2023-07-01 00:00:00 UTC');
        maxTotalSupply = await this.contract.getMaxTotalSupplyForTimestamp(date.getTime() / 1_000);
        maxTotalSupply.toString().should.equal("116100000000000000000000000"); // 38,700,000 + (38,700,000 * 2)

        // 3 years after start time
        date = new Date('2024-07-01 00:00:00 UTC');
        maxTotalSupply = await this.contract.getMaxTotalSupplyForTimestamp(date.getTime() / 1_000);
        // maxTotalSupply.toString().should.equal("154800000000000000000000000"); // 38,700,000 + (38,700,000 x 3)
        maxTotalSupply.toString().should.equal("154906027397260273972602739"); // https://docs.soliditylang.org/en/v0.8.0/units-and-global-variables.html#time-units

        // 9 years and 1 day after start time (i,e, 1 day after the end of the minting period)
        date = new Date('2030-07-02 00:00:00 UTC');
        maxTotalSupply = await this.contract.getMaxTotalSupplyForTimestamp(date.getTime() / 1_000);
        maxTotalSupply.toString().should.equal("387000000000000000000000000"); // 387,000,000

        // 10 years after start time (i,e, 1 year after the end of the minting period)
        date = new Date('2031-07-01 00:00:00 UTC');
        maxTotalSupply = await this.contract.getMaxTotalSupplyForTimestamp(date.getTime() / 1_000);
        maxTotalSupply.toString().should.equal("387000000000000000000000000"); // 387,000,000
    });

    describe('ERC20', function() {
        it('has the correct name', async function() {
            const name = await this.contract.name();
            name.should.equal('elimu.ai');
        });

        it('has the correct symbol', async function() {
            const symbol = await this.contract.symbol();
            symbol.should.equal('ELIMU');
        });

        it('has the correct decimal count', async function() {
            const decimals = await this.contract.decimals();
            decimals.toNumber().should.equal(18);
        });
    });

    describe('ERC20Capped', function() {
        it('has the correct cap', async function() {
            const cap = await this.contract.cap();
            cap.toString().should.equal("387000000000000000000000000");
        });

        it('has the correct total supply', async function() {
            const totalSupply = await this.contract.totalSupply();
            totalSupply.toString().should.equal("38700000000000000000000000");
        });

        it('cap exceeded', async function() {
            // TODO
        });
    });

    describe('AccessControl', function() {
        it('contract creator has "MINTER_ROLE"', async function() {
            const role = keccak256("MINTER_ROLE");
            const account = accounts[0];
            const hasRole = await this.contract.hasRole(role, account);
            assert.isTrue(hasRole);
        });

        it('non contract creator does not have "MINTER_ROLE"', async function() {
            const role = keccak256("MINTER_ROLE");
            const account = accounts[1];
            const hasRole = await this.contract.hasRole(role, account);
            assert.isFalse(hasRole);
        });

        it('contract creator can mint new tokens', async function() {
            // const startTime = new Date('2021-07-01 00:00:00 UTC').getTime();
            // if (new Date().getTime() < startTime) {
            //     // The current time is before the start of the minting period.
            //     // Simulate the passing of time - https://docs.openzeppelin.com/test-helpers/0.5/api#time
            //     await time.increaseTo(startTime);
            // }

            // const account = accounts[0];
            // const amount = 1_000;
            // const receipt = await this.contract.mint(account, amount);
            
            // // Verify that a Transfer event was emitted with the new value
            // expectEvent(receipt, 'Transfer');

            // // Verify that the account's balance increased by 1,000
            // // TODO

            // // Verify that the total supply increased by 1,000
            // const totalSupply = await this.contract.totalSupply();
            // totalSupply.toString().should.equal("38700000000000000000001000");
        });

        it('non contract creator cannot mint new tokens', async function() {
            // const account = accounts[1];
            // const amount = 2_000;
            // const receipt = await this.contract.mint(account, amount);

            // // Verify that the account's balance did not increase by 2,000
            // // TODO

            // // Verify that the total supply did not increase by 2,000
            // const totalSupply = await this.contract.totalSupply();
            // // // TODO
            // // totalSupply.toString().should.equal("38700000000000000000001000");
            
            // // // Verify that the transaction was reverted
            // // // TODO
            // // await expectRevert(
            // //     this.contract.mint(non_owner, amount),
            // //     'Ownable: caller is not the owner'
            // // );
        });
    });
});
