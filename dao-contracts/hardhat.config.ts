import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
console.log("PRIVATE_KEY.length: " + PRIVATE_KEY.length);

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
console.log("ETHERSCAN_API_KEY.length: " + ETHERSCAN_API_KEY.length);

const config: HardhatUserConfig = {
  networks: {
    sepolia: {
      // chainId: 11155111,
      url: "https://sepolia.drpc.org",
      accounts: [PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
  sourcify: {
    enabled: true
  },
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
