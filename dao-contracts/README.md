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
npx hardhat ignition deploy ./ignition/modules/Contributors.ts --network hardhat
npx hardhat ignition deploy ./ignition/modules/RoleResolver.ts --network hardhat
```

### Sepolia (Chain ID `11155111`)

```shell
npx hardhat ignition deploy ./ignition/modules/ELIMU.ts --network sepolia --deployment-id sepolia_v1-0-6 --verify
npx hardhat ignition deploy ./ignition/modules/gELIMU.ts --network sepolia --deployment-id sepolia_v1-0-6 --verify
npx hardhat ignition deploy ./ignition/modules/Languages.ts --network sepolia --deployment-id sepolia_v1-0-6 --verify
npx hardhat ignition deploy ./ignition/modules/Roles.ts --network sepolia --deployment-id sepolia_v1-0-6 --verify
npx hardhat ignition deploy ./ignition/modules/Contributors.ts --network sepolia --deployment-id sepolia_v1-0-6 --verify
npx hardhat ignition deploy ./ignition/modules/RoleResolver.ts --network sepolia --deployment-id sepolia_v1-0-6 --verify
```

[`./ignition/deployments/chain-11155111/deployed_addresses.json`](./ignition/deployments/chain-11155111/deployed_addresses.json)

EAS schema using the `RoleResolver`: https://sepolia.easscan.org/schema/view/0x2228b949fb8b13a7d314bef8f9888c325d16d8f49f28a71a772ba16eb7942314

### Mainnet (Chain ID `1`)

```shell
npx hardhat ignition deploy ./ignition/modules/Languages.ts --network mainnet --deployment-id mainnet_v1-0-6 --verify
npx hardhat ignition deploy ./ignition/modules/Roles.ts --network mainnet --deployment-id mainnet_v1-0-6 --verify
npx hardhat ignition deploy ./ignition/modules/Contributors.ts --network mainnet --deployment-id mainnet_v1-0-6 --verify
npx hardhat ignition deploy ./ignition/modules/RoleResolver.ts --network mainnet --deployment-id mainnet_v1-0-6 --verify
```

[`./ignition/deployments/chain-1/deployed_addresses.json`](./ignition/deployments/chain-1/deployed_addresses.json)

EAS schema using the `RoleResolver`: https://easscan.org/schema/view/0x2228b949fb8b13a7d314bef8f9888c325d16d8f49f28a71a772ba16eb7942314
