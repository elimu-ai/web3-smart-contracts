const keccak256 = web3.utils.keccak256;
const { expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');

const UniswapPoolRewards = artifacts.require('UniswapPoolRewards');

require('chai').should();

contract('UniswapPoolRewards', accounts => {

    console.log('accounts: ' + accounts);

    const ADMIN_ROLE = keccak256("ADMIN_ROLE");

    beforeEach(async function() {
        this.contract = await UniswapPoolRewards.deployed();
    });

    it('deployed successfully', async function() {
        const address = await this.contract.address;
        assert.notEqual(address, 0x0);
        assert.notEqual(address, "");
        assert.notEqual(address, null);
        assert.notEqual(address, undefined);
    });

    // TODO
});
