require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');
const infuraKey = process.env.INFURA_API_KEY;
const mnemonic = process.env.HDWALLET_MNEMONIC;

module.exports = {

  networks: {
    // development: {
    //  host: "127.0.0.1",
    //  port: 8545,
    //  network_id: "*"
    // },
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    rinkeby: {
      provider: () => new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${infuraKey}`),
      network_id: 4,
      gas: 2_500_000,
      gasPrice: 4_000_000_000, // 4 gwei (in wei)
      timeoutBlocks: 200
    },
    goerli: {
      provider: () => new HDWalletProvider(mnemonic, 'https://rpc.ankr.com/eth_goerli'),
      network_id: 5,
      networkCheckTimeout: 60_000, // 1 minute
      gas: 2_500_000,
      gasPrice: 4_000_000_000, // 4 gwei (in wei)
      timeoutBlocks: 200
    },
    mainnet: {
      provider: () => new HDWalletProvider(mnemonic, 'https://rpc.ankr.com/eth'),
      network_id: 1,
      networkCheckTimeout: 60_000, // 1 minute
      gas: 2_500_000,
      gasPrice: 8_000_000_000, // 8 gwei (in wei)
      timeoutBlocks: 200
    }
  },

  compilers: {
    solc: {
      version: "0.8.19"
    }
  },

  plugins: [
    'solidity-coverage',
    'truffle-plugin-verify'
  ],

  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY
  }
};
