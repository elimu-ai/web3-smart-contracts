// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers, network } from "hardhat";

const RoleResolverModule = buildModule("RoleResolverModule", (m) => {
  console.log("network.name:", network.name);

  let easAddress = ethers.ZeroAddress;
  if (network.name == "sepolia") {
    easAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e";
  } else if (network.name == "mainnet") {
    easAddress = "0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587";
  }
  console.log("easAddress:", easAddress);

  let rolesAddress = ethers.ZeroAddress;
  if (network.name == "sepolia") {
    rolesAddress = require("../deployments/sepolia_v1-0-5/deployed_addresses.json")["RolesModule#Roles"];
  } else if (network.name == "mainnet") {
    rolesAddress = require("../deployments/mainnet_v1-0-5/deployed_addresses.json")["RolesModule#Roles"];
  }
  console.log("rolesAddress:", rolesAddress);

  const roleResolver = m.contract("RoleResolver", [easAddress, rolesAddress]);
  return { roleResolver };
});

export default RoleResolverModule;
