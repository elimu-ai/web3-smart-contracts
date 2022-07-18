const ElimuDisperse = artifacts.require('ElimuDisperse');

require('chai').should();

contract('ElimuDisperse', accounts => {

    console.log('accounts: ' + accounts);

    beforeEach(async function() {
        this.contract = await ElimuDisperse.deployed();
    });

    it('deployed successfully', async function() {
        const address = await this.contract.address;
        assert.notEqual(address, 0x0);
        assert.notEqual(address, "");
        assert.notEqual(address, null);
        assert.notEqual(address, undefined);
    });
});
