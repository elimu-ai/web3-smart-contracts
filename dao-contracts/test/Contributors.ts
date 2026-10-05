import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

describe("Contributors", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const Contributors = await hre.ethers.getContractFactory("Contributors");
    const contributors = await Contributors.deploy();

    return { contributors, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set owner", async function () {
      const { contributors, owner } = await loadFixture(deployFixture);

      expect(await contributors.owner()).to.equal(await owner.getAddress());
    });
  });
});
