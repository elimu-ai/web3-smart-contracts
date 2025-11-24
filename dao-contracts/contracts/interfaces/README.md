# DAO Contracts

Utility smart contracts for the Ξlimu DAO.

If you want to integrate external smart contracts with the smart contracts deployed by the Ξlimu DAO, install this library:

```shell
npm install @elimu-ai/dao-contracts
```

Then, instantiate the smart contract(s) you want to interact with:

```solidity
import { ILanguages } from "@elimu-ai/dao-contracts/ILanguages.sol";
import { IRoles } from "@elimu-ai/dao-contracts/IRoles.sol";

contract MyContract {

    ILanguages public languages;
    IRoles public roles;

    constructor() {
        languages = ILanguages("0xa9f1bD888112659Cd78803dbE2C8B3daedf0Eb1F");
        roles = IRoles("0x9aAa9f6189cF070e1149E9C85c4d10526f430cE3");
    }

    ...
}
```

---

The mission of elimu.ai is to build innovative learning software that empowers out-of-school children to teach themselves basic reading📖, writing✍🏽 and math🔢 **within 6 months**.

To learn more about the Ξlimu DAO, see https://github.com/elimu-ai/web3-wiki
