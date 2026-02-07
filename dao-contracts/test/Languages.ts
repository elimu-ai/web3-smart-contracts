import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Languages", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const Languages = await hre.ethers.getContractFactory("Languages");
    const languages = await Languages.deploy();

    return { languages, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { languages, owner } = await loadFixture(deployFixture);

      expect(await languages.owner()).to.equal(owner.address);
    });

    it("Should not set any supported languages", async function () {
      const { languages } = await loadFixture(deployFixture);

      expect(await languages.isSupportedLanguage("ENG")).to.equal(false);
      expect(await languages.isSupportedLanguage("HIN")).to.equal(false);
      expect(await languages.isSupportedLanguage("TGL")).to.equal(false);
      expect(await languages.isSupportedLanguage("THA")).to.equal(false);
      expect(await languages.isSupportedLanguage("VIE")).to.equal(false);
    });
  });

  describe("Update owner address", function () {
    it("Should revert when non-owner tries to update owner", async function () {
      const { languages, otherAccount } = await loadFixture(deployFixture);
      
      await expect(
        languages.connect(otherAccount).transferOwnership(otherAccount.address)
      ).to.be.revertedWithCustomError(languages, "OwnableUnauthorizedAccount");
    });
    
    it("Should change the owner", async function () {
      const { languages, owner, otherAccount } = await loadFixture(deployFixture);

      expect(await languages.owner()).to.equal(owner.address);
      await languages.transferOwnership(otherAccount.address);
      expect(await languages.owner()).to.equal(otherAccount.address);
    });

    it("Should emit OwnershipTransferred event", async function () {
      const { languages, owner, otherAccount } = await loadFixture(deployFixture);
      
      await expect(languages.transferOwnership(otherAccount.address))
        .to.emit(languages, "OwnershipTransferred")
        .withArgs(owner.address, otherAccount.address);
    });
  });

  describe("Add supported language", function () {
    it("Should revert when non-owner tries to add language", async function () {
      const { languages, otherAccount } = await loadFixture(deployFixture);
      
      await expect(
        languages.connect(otherAccount).addSupportedLanguage("ENG")
      ).to.be.revertedWithCustomError(languages, "OwnableUnauthorizedAccount");
    });
    
    it("Newly set supported language should return `true`", async function () {
      const { languages } = await loadFixture(deployFixture);

      expect(await languages.isSupportedLanguage("ENG")).to.equal(false);
      await languages.addSupportedLanguage("ENG");
      expect(await languages.isSupportedLanguage("ENG")).to.equal(true);
    });

    it("Upper-case and lower-case values should be considered different", async function () {
      const { languages } = await loadFixture(deployFixture);

      expect(await languages.isSupportedLanguage("ENG")).to.equal(false);
      await languages.addSupportedLanguage("eng");
      expect(await languages.isSupportedLanguage("ENG")).to.equal(false);
    });
  });

  describe("Remove supported language", function () {
    it("Should revert when non-owner tries to remove language", async function () {
      const { languages, otherAccount } = await loadFixture(deployFixture);
      
      await languages.addSupportedLanguage("ENG");
      await expect(
        languages.connect(otherAccount).removeSupportedLanguage("ENG")
      ).to.be.revertedWithCustomError(languages, "OwnableUnauthorizedAccount");
    });

    it("Newly removed supported language should return `false`", async function () {
      const { languages } = await loadFixture(deployFixture);

      expect(await languages.isSupportedLanguage("ENG")).to.equal(false);
      await languages.addSupportedLanguage("ENG");
      expect(await languages.isSupportedLanguage("ENG")).to.equal(true);
      await languages.removeSupportedLanguage("ENG");
      expect(await languages.isSupportedLanguage("ENG")).to.equal(false);
    });
  });
});
