// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const GElimuModule = buildModule("gELIMUModule", (m) => {
  const gElimu = m.contract("DummyERC20", ["elimu.ai Governance", "gELIMU"]);
  return { gElimu };
});

export default GElimuModule;
