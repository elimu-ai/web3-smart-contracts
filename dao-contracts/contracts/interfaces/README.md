# DAO Contracts

> Utility smart contracts for the Ξlimu DAO

If you want to integrate external smart contracts with the smart contracts deployed by the Ξlimu DAO, install this library:

```shell
npm install @elimu-ai/dao-contracts
```

Then, instantiate the smart contract you want to interact with:

```solidity
import {ILanguages} from "@elimu-ai/dao-contracts/ILanguages.sol";

contract Languages {

    ILanguages public languages;

    constructor() {
        languages = ILanguages("0x...")
    }

    ...
}
```

---

> The mission of elimu.ai is to build innovative learning software that empowers out-of-school children to teach themselves basic reading📖, writing✍🏽 and math🔢 **within 6 months**.

To learn more about the Ξlimu DAO, see https://github.com/elimu-ai/web3-wiki
