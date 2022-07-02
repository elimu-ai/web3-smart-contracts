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

## Balancer ⚖️

 * Swap: https://app.balancer.fi/#/trade/ether/0xe29797910d413281d2821d5d9a989262c8121cc2
 * Pool: https://app.balancer.fi/#/pool/0x517390b2b806cb62f20ad340de6d98b2a8f17f2b0002000000000000000001ba

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

## Deploy to Test Network (Rinkeby) 🚀🚀

Configure `INFURA_API_KEY` in `.env`, and then run the following:

```
truffle migrate --network rinkeby
```

https://rinkeby.etherscan.io/address/0xe29797910d413281d2821d5d9a989262c8121cc2

### Verify Source Code on Etherscan (Rinkeby) ✅

See https://github.com/rkalis/truffle-plugin-verify

Configure `ETHERSCAN_API_KEY` in `.env`, and then run the following:

```
truffle run verify ElimuToken --network rinkeby
```

## Deploy to Test Network (Kovan) 🚀🚀

Configure `INFURA_API_KEY` in `.env`, and then run the following:

```
truffle migrate --network kovan
```

https://kovan.etherscan.io/address/0x6d63a5d57148b91805ca9741c00b89b7f81708b3

### Verify Source Code on Etherscan (Kovan) ✅

See https://github.com/rkalis/truffle-plugin-verify

Configure `ETHERSCAN_API_KEY` in `.env`, and then run the following:

```
truffle run verify ElimuToken --network kovan
```
