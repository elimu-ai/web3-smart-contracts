import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

describe("RoleCondition", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const PermissionCondition = await hre.ethers.getContractFactory("DummyPermissionCondition");
    const permissionCondition = await PermissionCondition.deploy();

    const ElimuToken = await hre.ethers.getContractFactory("DummyERC20");
    const elimuToken = await ElimuToken.deploy("elimu.ai", "ELIMU");

    const GElimuToken = await hre.ethers.getContractFactory("DummyERC20");
    const gElimuToken = await GElimuToken.deploy("Governance elimu.ai", "gELIMU");

    const Contributors = await hre.ethers.getContractFactory("Contributors");
    const contributors = await Contributors.deploy();
    await contributors.updateAmount(otherAccount.address, ethers.parseEther("3870000"));

    const Roles = await hre.ethers.getContractFactory("Roles");
    const roles = await Roles.deploy(elimuToken.getAddress(), gElimuToken.getAddress(), contributors.getAddress());

    const RoleCondition = await hre.ethers.getContractFactory("RoleCondition");
    const roleCondition = await RoleCondition.deploy(permissionCondition.getAddress(), roles.getAddress());

    return { roleCondition, roles, permissionCondition, contributors, elimuToken, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set address of PermissionCondition contract", async function () {
      const { roleCondition, permissionCondition } = await loadFixture(deployFixture);

      expect(await roleCondition.votingPowerCondition()).to.equal(await permissionCondition.getAddress());
    });

    it("Should set address of Roles contract", async function () {
      const { roleCondition, roles } = await loadFixture(deployFixture);

      expect(await roleCondition.roles()).to.equal(await roles.getAddress());
    });
  });

  describe("Permission granting", function () {
    it("Should return `false` if user holds no tokens", async function () {
      const { roleCondition, otherAccount } = await loadFixture(deployFixture);

      const where = ethers.ZeroAddress;
      
      const who = otherAccount.address;
      console.log("who:", who);
      
      const permissionId = ethers.id("CREATE_PROPOSAL_PERMISSION");
      console.log("permissionId:", permissionId);

      const data = ethers.getBytes("0x");

      expect(await roleCondition.isGranted(where, who, permissionId, data)).to.equal(false);
    });

    it("Should return `false` if user holds tokens that were not earned via Drip List", async function () {
      const { roleCondition, elimuToken, contributors, owner } = await loadFixture(deployFixture);

      const where = ethers.ZeroAddress;
      
      const who = owner.address;
      console.log("who:", who);
      console.log("$ELIMU token balance:", ethers.formatEther(await elimuToken.balanceOf(who)));
      console.log("$ELIMU tokens earned via Drip List:", ethers.formatEther(await contributors.collectedViaDrips(who)));

      const permissionId = ethers.id("CREATE_PROPOSAL_PERMISSION");
      console.log("permissionId:", permissionId);

      const data = ethers.getBytes("0x");

      expect(await roleCondition.isGranted(where, who, permissionId, data)).to.equal(false);
    });

    it("Should return `true` if user holds at least 3,870,000 tokens that were earned via Drip List", async function () {
      const { roleCondition, elimuToken, contributors, owner } = await loadFixture(deployFixture);

      const where = ethers.ZeroAddress;
      
      const who = owner.address;
      console.log("who:", who);
      console.log("$ELIMU token balance:", ethers.formatEther(await elimuToken.balanceOf(who)));

      await contributors.updateAmount(who, ethers.parseEther("3870000"));
      console.log("$ELIMU tokens earned via Drip List:", ethers.formatEther(await contributors.collectedViaDrips(who)));
      
      const permissionId = ethers.id("CREATE_PROPOSAL_PERMISSION");
      console.log("permissionId:", permissionId);

      const data = ethers.getBytes("0x");

      expect(await roleCondition.isGranted(where, who, permissionId, data)).to.equal(true);
    });

    it("Should return `false` if user earned at least 3,870,000 tokens via Drip List, but no longer holds them", async function () {
      const { roleCondition, elimuToken, contributors, otherAccount } = await loadFixture(deployFixture);

      const where = ethers.ZeroAddress;
      
      const who = otherAccount.address;
      console.log("who:", who);
      console.log("$ELIMU token balance:", ethers.formatEther(await elimuToken.balanceOf(who)));

      await contributors.updateAmount(who, ethers.parseEther("3870000"));
      console.log("$ELIMU tokens earned via Drip List:", ethers.formatEther(await contributors.collectedViaDrips(who)));
      
      const permissionId = ethers.id("CREATE_PROPOSAL_PERMISSION");
      console.log("permissionId:", permissionId);

      const data = ethers.getBytes("0x");

      expect(await roleCondition.isGranted(where, who, permissionId, data)).to.equal(false);
    });
  });
});
