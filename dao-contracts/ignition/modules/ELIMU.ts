// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ElimuModule = buildModule("ELIMUModule", (m) => {
  const elimu = m.contract("DummyERC20", ["elimu.ai", "ELIMU"]);
  return { elimu };
});

export default ElimuModule;
