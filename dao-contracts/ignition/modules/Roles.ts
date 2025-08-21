// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers, network } from "hardhat";

const RolesModule = buildModule("RolesModule", (m) => {
  console.log("network.name:", network.name);

  let elimuAddress = ethers.ZeroAddress;
  if (network.name == "sepolia") {
    // .../deployments/chain-11155111/deployed_addresses.json
    elimuAddress = "0xf4B2e968d9715Fbc0CD57E306A71036D2023bAD0";
  } else if (network.name == "mainnet") {
    elimuAddress = "0xe29797910D413281d2821D5d9a989262c8121CC2";
  }
  console.log("elimuAddress:", elimuAddress);

  let gElimuAddress = ethers.ZeroAddress;
  if (network.name == "sepolia") {
    // .../deployments/chain-11155111/deployed_addresses.json
    gElimuAddress = "0x544096415caD910d528465503655AAcfAAf7deaA";
  } else if (network.name == "mainnet") {
    gElimuAddress = "0xBeC06361c9451C8C493e74D6a1Df8428cdce5D53";
  }
  console.log("gElimuAddress:", gElimuAddress);
  
  const roles = m.contract("Roles", [elimuAddress, gElimuAddress]);
  return { roles };
});

export default RolesModule;
