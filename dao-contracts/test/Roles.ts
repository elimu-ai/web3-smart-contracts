import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

describe("Roles", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const ElimuToken = await hre.ethers.getContractFactory("DummyERC20");
    const elimuToken = await ElimuToken.deploy("elimu.ai", "ELIMU");

    const GElimuToken = await hre.ethers.getContractFactory("DummyERC20");
    const gElimuToken = await GElimuToken.deploy("Governance elimu.ai", "gELIMU");

    const Roles = await hre.ethers.getContractFactory("Roles");
    const roles = await Roles.deploy(elimuToken.getAddress(), gElimuToken.getAddress());

    return { roles, elimuToken, gElimuToken, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set governance tokens", async function () {
      const { roles, elimuToken, gElimuToken } = await loadFixture(deployFixture);

      expect(await roles.elimuToken()).to.equal(await elimuToken.getAddress());
      expect(await roles.gElimuToken()).to.equal(await gElimuToken.getAddress());
    });
  });

  describe("DAO Proposer🗳️  role", function () {
    it("Should return `false` when zero balance", async function () {
      const { roles, otherAccount } = await loadFixture(deployFixture);

      expect(await roles.isDaoProposer(otherAccount)).to.equal(false);
    });

    it("Should return `true` when $ELIMU balance 387,000 or higher", async function () {
      const { roles, elimuToken, otherAccount } = await loadFixture(deployFixture);

      await elimuToken.transfer(otherAccount, ethers.parseEther("386999"));
      expect(await roles.isDaoProposer(otherAccount)).to.equal(false);

      await elimuToken.transfer(otherAccount, ethers.parseEther("1"));
      expect(await roles.isDaoProposer(otherAccount)).to.equal(true);
    });

    it("Should return `true` when $gELIMU balance 387,000 or higher", async function () {
      const { roles, gElimuToken, otherAccount } = await loadFixture(deployFixture);

      await gElimuToken.transfer(otherAccount, ethers.parseEther("386999"));
      expect(await roles.isDaoProposer(otherAccount)).to.equal(false);

      await gElimuToken.transfer(otherAccount, ethers.parseEther("1"));
      expect(await roles.isDaoProposer(otherAccount)).to.equal(true);
    });

    it("Should return `true` when ($ELIMU + $gELIMU) balance 387,000 or higher", async function () {
      const { roles, elimuToken, gElimuToken, otherAccount } = await loadFixture(deployFixture);

      await elimuToken.transfer(otherAccount, ethers.parseEther("193500"));
      expect(await roles.isDaoProposer(otherAccount)).to.equal(false);

      await gElimuToken.transfer(otherAccount, ethers.parseEther("193499"));
      expect(await roles.isDaoProposer(otherAccount)).to.equal(false);

      await gElimuToken.transfer(otherAccount, ethers.parseEther("1"));
      expect(await roles.isDaoProposer(otherAccount)).to.equal(true);
    });
  });

  describe("DAO Operator🛞  role", function () {
    it("Should return `false` when zero balance", async function () {
      const { roles, otherAccount } = await loadFixture(deployFixture);

      expect(await roles.isDaoOperator(otherAccount)).to.equal(false);
    });

    it("Should return `true` when $ELIMU balance 1,935,000 or higher", async function () {
      const { roles, elimuToken, otherAccount } = await loadFixture(deployFixture);

      await elimuToken.transfer(otherAccount, ethers.parseEther("1934999"));
      expect(await roles.isDaoOperator(otherAccount)).to.equal(false);

      await elimuToken.transfer(otherAccount, ethers.parseEther("1"));
      expect(await roles.isDaoOperator(otherAccount)).to.equal(true);
    });

    it("Should return `true` when $gELIMU balance 1,935,000 or higher", async function () {
      const { roles, gElimuToken, otherAccount } = await loadFixture(deployFixture);

      await gElimuToken.transfer(otherAccount, ethers.parseEther("1934999"));
      expect(await roles.isDaoOperator(otherAccount)).to.equal(false);

      await gElimuToken.transfer(otherAccount, ethers.parseEther("1"));
      expect(await roles.isDaoOperator(otherAccount)).to.equal(true);
    });

    it("Should return `true` when ($ELIMU + $gELIMU) balance 1,935,000 or higher", async function () {
      const { roles, elimuToken, gElimuToken, otherAccount } = await loadFixture(deployFixture);

      await elimuToken.transfer(otherAccount, ethers.parseEther("967500"));
      expect(await roles.isDaoOperator(otherAccount)).to.equal(false);

      await gElimuToken.transfer(otherAccount, ethers.parseEther("967499"));
      expect(await roles.isDaoOperator(otherAccount)).to.equal(false);

      await gElimuToken.transfer(otherAccount, ethers.parseEther("1"));
      expect(await roles.isDaoOperator(otherAccount)).to.equal(true);
    });
  });

  describe("DAO Administrator🔐 role", function () {
    it("Should return `false` when zero balance", async function () {
      const { roles, otherAccount } = await loadFixture(deployFixture);

      expect(await roles.isDaoAdministrator(otherAccount)).to.equal(false);
    });

    it("Should return `true` when $ELIMU balance 3,870,000 or higher", async function () {
      const { roles, elimuToken, otherAccount } = await loadFixture(deployFixture);

      await elimuToken.transfer(otherAccount, ethers.parseEther("3869999"));
      expect(await roles.isDaoAdministrator(otherAccount)).to.equal(false);

      await elimuToken.transfer(otherAccount, ethers.parseEther("1"));
      expect(await roles.isDaoAdministrator(otherAccount)).to.equal(true);
    });

    it("Should return `true` when $gELIMU balance 3,870,000 or higher", async function () {
      const { roles, gElimuToken, otherAccount } = await loadFixture(deployFixture);

      await gElimuToken.transfer(otherAccount, ethers.parseEther("3869999"));
      expect(await roles.isDaoAdministrator(otherAccount)).to.equal(false);

      await gElimuToken.transfer(otherAccount, ethers.parseEther("1"));
      expect(await roles.isDaoAdministrator(otherAccount)).to.equal(true);
    });

    it("Should return `true` when ($ELIMU + $gELIMU) balance 3,870,000 or higher", async function () {
      const { roles, elimuToken, gElimuToken, otherAccount } = await loadFixture(deployFixture);

      await elimuToken.transfer(otherAccount, ethers.parseEther("1935000"));
      expect(await roles.isDaoAdministrator(otherAccount)).to.equal(false);

      await gElimuToken.transfer(otherAccount, ethers.parseEther("1934999"));
      expect(await roles.isDaoAdministrator(otherAccount)).to.equal(false);

      await gElimuToken.transfer(otherAccount, ethers.parseEther("1"));
      expect(await roles.isDaoAdministrator(otherAccount)).to.equal(true);
    });
  });
});
