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

### Hardhat (`localhost`)

```shell
npx hardhat node
```
```shell
npx hardhat ignition deploy ./ignition/modules/ELIMU.ts --network hardhat
npx hardhat ignition deploy ./ignition/modules/gELIMU.ts --network hardhat
npx hardhat ignition deploy ./ignition/modules/Languages.ts --network hardhat
npx hardhat ignition deploy ./ignition/modules/Roles.ts --network hardhat
```

### Sepolia (Chain ID `11155111`)

```shell
npx hardhat ignition deploy ./ignition/modules/ELIMU.ts --network sepolia --reset --verify
npx hardhat ignition deploy ./ignition/modules/gELIMU.ts --network sepolia --verify
npx hardhat ignition deploy ./ignition/modules/Languages.ts --network sepolia --verify
npx hardhat ignition deploy ./ignition/modules/Roles.ts --network sepolia --verify
```

[`./ignition/deployments/chain-11155111/deployed_addresses.json`](./ignition/deployments/chain-11155111/deployed_addresses.json)

### Mainnet (Chain ID `1`)

```shell
npx hardhat ignition deploy ./ignition/modules/Languages.ts --network mainnet --reset --verify
npx hardhat ignition deploy ./ignition/modules/Roles.ts --network mainnet --verify
```

[`./ignition/deployments/chain-1/deployed_addresses.json`](./ignition/deployments/chain-1/deployed_addresses.json)
