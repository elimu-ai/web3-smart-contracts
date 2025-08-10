import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true
      }
    }
  },
  gasReporter: {
    enabled: true,
    outputFile: "hardhat-gas-report.md"
  }
};

export default config;
