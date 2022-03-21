# Community Token 💎

[![built-with openzeppelin](https://img.shields.io/badge/built%20with-OpenZeppelin-3677FF)](https://docs.openzeppelin.com/)

## Etherscan

https://etherscan.io/token/0xe29797910d413281d2821d5d9a989262c8121cc2

## Uniswap 🦄

 * Swap: https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0xe29797910d413281d2821d5d9a989262c8121cc2
 * Pool: https://app.uniswap.org/#/add/v2/ETH/0xe29797910d413281d2821d5d9a989262c8121cc2

## SushiSwap 🍣

 * Swap: https://app.sushi.com/en/swap?inputCurrency=ETH&outputCurrency=0xe29797910d413281d2821d5d9a989262c8121cc2
 * Pool: https://app.sushi.com/add/ETH/0xe29797910d413281d2821d5d9a989262c8121cc2

## Setup Development Environment 👩🏽‍💻

Install Node:

```
brew install node
```

Install Truffle:

```
npm install truffle -g
```

## Download Dependencies ⬇️

```
npm install
```

## Compile Smart Contract

```
truffle compile
```

## Test Smart Contract

```
truffle test
```

## Deploy to Development Network 🚀

Install and launch [Ganache](https://www.trufflesuite.com/ganache). Then run the following:

```
truffle migrate --network ganache
```

## Deploy to Test Network 🚀

Configure `INFURA_API_KEY` in `.env`, and then run the following:

```
truffle migrate --network rinkeby
```

https://rinkeby.etherscan.io/address/0xe29797910d413281d2821d5d9a989262c8121cc2

## Verify Source Code on Etherscan ✅

See https://github.com/rkalis/truffle-plugin-verify

Configure `ETHERSCAN_API_KEY` in `.env`, and then run the following:

```
truffle run verify ElimuToken --network rinkeby
```
