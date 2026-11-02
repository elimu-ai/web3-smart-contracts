// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers, network } from "hardhat";

const RoleConditionModule = buildModule("RoleConditionModule", (m) => {
  console.log("network.name:", network.name);

  let votingPowerConditionAddress = ethers.ZeroAddress;
  if (network.name == "sepolia") {
    votingPowerConditionAddress = "0xA239cFbF2b6658f61b7B041712C75d9D28B1E2BF";
  } else if (network.name == "mainnet") {
    votingPowerConditionAddress = "0x726a128690c851000B428E70F9f18a3A0877F621";
  }
  console.log("votingPowerConditionAddress:", votingPowerConditionAddress);

  let rolesAddress = ethers.ZeroAddress;
  if (network.name == "sepolia") {
    rolesAddress = require("../deployments/sepolia_v1-0-5/deployed_addresses.json")["RolesModule#Roles"];
  } else if (network.name == "mainnet") {
    rolesAddress = require("../deployments/mainnet_v1-0-5/deployed_addresses.json")["RolesModule#Roles"];
  }
  console.log("rolesAddress:", rolesAddress);

  const roleCondition = m.contract("RoleCondition", [votingPowerConditionAddress, rolesAddress]);
  return { roleCondition };
});

export default RoleConditionModule;
