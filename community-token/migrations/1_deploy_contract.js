const ElimuToken = artifacts.require("ElimuToken");

module.exports = function (deployer) {
  deployer.deploy(ElimuToken);
};
