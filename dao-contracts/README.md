# DAO Contracts 📦

Utility smart contracts for the Ξlimu DAO.

https://www.npmjs.com/package/@elimu-ai/dao-contracts

## Compiling

```shell
npm install
npx hardhat clean
npx hardhat compile
```

## Testing

```shell
npx hardhat test
npx hardhat coverage
npx istanbul check-coverage --lines 80
```

## Deployment

### Hardhat

```shell
npx hardhat node
```
```shell
npx hardhat ignition deploy ./ignition/modules/Languages.ts --network hardhat
```

### Sepolia

```shell
npx hardhat ignition deploy ./ignition/modules/Languages.ts --network sepolia --verify
```

[`./ignition/deployments/chain-11155111/deployed_addresses.json`](./ignition/deployments/chain-11155111/deployed_addresses.json)
