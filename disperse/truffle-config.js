require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');
const infuraKey = process.env.INFURA_API_KEY;
const mnemonic = process.env.HDWALLET_MNEMONIC;

module.exports = {

  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
      gasPrice: 5_000_000_000, // 5 gwei (in wei)
      timeoutBlocks: 240 // 3,600 / 15 = 240
    },
    rinkeby: {
      provider: () => new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${infuraKey}`),
      network_id: 4,
      gasPrice: 5_000_000_000,  // 5 gwei (in wei)
      timeoutBlocks: 240 // 3,600 / 15 = 240
    },
    mainnet: {
      provider: () => new HDWalletProvider(mnemonic, `https://mainnet.infura.io/v3/${infuraKey}`),
      network_id: 1,
      gasPrice: 5_000_000_000, // 5 gwei (in wei)
      timeoutBlocks: 240 // 3,600 / 15 = 240
    }
  },

  compilers: {
    solc: {
      version: "0.8.15"
    }
  },

  db: {
    enabled: true
  },

  plugins: [
    'truffle-plugin-verify'
  ],

  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY
  }
};
