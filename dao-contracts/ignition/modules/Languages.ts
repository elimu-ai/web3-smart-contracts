// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LanguagesModule = buildModule("LanguagesModule", (m) => {
  const languages = m.contract("Languages");
  return { languages };
});

export default LanguagesModule;
