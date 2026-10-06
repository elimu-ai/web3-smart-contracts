// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers, network } from "hardhat";

const ContributorsModule = buildModule("ContributorsModule", (m) => {
  console.log("network.name:", network.name);

  const contributors = m.contract("Contributors");
  return { contributors };
});

export default ContributorsModule;
