# Liquidity Provider Rewards 💸

## Install Truffle

```
npm install truffle@5.5.24 -g
```

## Install Dependencies

```
npm install
```

## Build

```
truffle compile
```

## Test

```
truffle test
```

## Deploy to Development Network

```
truffle migrate
```

## Code Coverage

[![codecov](https://codecov.io/gh/elimu-ai/web3-smart-contracts/branch/main/graph/badge.svg?token=98QZ0IIDDL)](https://codecov.io/gh/elimu-ai/web3-smart-contracts)

[![](https://codecov.io/gh/elimu-ai/web3-smart-contracts/branch/main/graphs/tree.svg?token=98QZ0IIDDL)](https://codecov.io/gh/elimu-ai/web3-smart-contracts)

```
truffle run coverage
open coverage/index.html
```

## Testnet (Rinkeby)

### $ELIMU Token 💎

- Token address: https://rinkeby.etherscan.io/token/0xe29797910d413281d2821d5d9a989262c8121cc2

### Uniswap Pool 🦄

- Pool token: https://rinkeby.etherscan.io/token/0x9936bdcd16e8c709c4cb8d7b871f0011b4cc65de
- UI (swap): https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0xe29797910d413281d2821d5d9a989262c8121cc2&chain=rinkeby
- UI (pool): https://app.uniswap.org/#/add/v2/ETH/0xe29797910D413281d2821D5d9a989262c8121CC2?chain=rinkeby

#### Rewards Contract 💸 

```
truffle migrate --network rinkeby
```

https://rinkeby.etherscan.io/address/0xdD4b811DD62A1DE482f0D3863DAe55A672a461b2

```
truffle run verify UniswapPoolRewards --network rinkeby
```

https://rinkeby.etherscan.io/address/0xdD4b811DD62A1DE482f0D3863DAe55A672a461b2#code

## Testnet (Kovan)

### $ELIMU Token 💎

- Token address: https://kovan.etherscan.io/token/0x6d63a5d57148b91805ca9741c00b89b7f81708b3

### Uniswap Pool 🦄

- Pool token: https://kovan.etherscan.io/token/0x2c3de9b3fb7b4d67c8fb58cc7799bbb6e839a694
- UI: https://kovan-uniswap.netlify.app/add-liquidity

### SushiSwap Pool 🍣

- Pool token: `// TODO`
- UI: https://app.sushi.com/legacy/pool?chainId=42

### Balancer Pool ⚖️

- Pool token: `// TODO`
- UI: https://kovan.balancer.fi/#/

## Mainnet

### $ELIMU Token 💎

- Token address: https://etherscan.io/token/0xe29797910d413281d2821d5d9a989262c8121cc2

### Uniswap Pool 🦄

- Pool token: https://etherscan.io/token/0xa0d230dca71a813c68c278ef45a7dac0e584ee61
- UI (swap): https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0xe29797910d413281d2821d5d9a989262c8121cc2
- UI (pool): https://app.uniswap.org/#/add/v2/ETH/0xe29797910d413281d2821d5d9a989262c8121cc2

### SushiSwap Pool 🍣

- Pool token: https://etherscan.io/token/0x0E2a3d127EDf3BF328616E02F1DE47F981Cf496A
- UI (swap): https://app.sushi.com/swap?inputCurrency=ETH&outputCurrency=0xe29797910D413281d2821D5d9a989262c8121CC2
- UI (pool): https://app.sushi.com/add/ETH/0xe29797910D413281d2821D5d9a989262c8121CC2

### Rewards Contract 💸

#### Uniswap 🦄

```
truffle migrate --network mainnet
```

https://etherscan.io/address/0x6ba828e01713cef8ab59b64198d963d0e42e0aea

```
truffle run verify UniswapPoolRewards --network mainnet
```

https://etherscan.io/address/0x6ba828e01713cef8ab59b64198d963d0e42e0aea#code

#### SushiSwap 🍣

https://github.com/trufflesuite/truffle-migrate/issues/23#issuecomment-401290273

```
truffle migrate -f 2 --to 2 --network mainnet 
```

https://etherscan.io/address/0x92bc866ff845a5050b3c642dec94e5572305872f

```
truffle run verify SushiSwapPoolRewards --network mainnet
```

https://etherscan.io/address/0x92bc866ff845a5050b3c642dec94e5572305872f#code

## UI

See https://github.com/elimu-ai/web3-liquidity-rewards-ui
