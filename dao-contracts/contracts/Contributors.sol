// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import { IContributors } from "./interfaces/IContributors.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice This smart contract stores the amount of tokens collected by each Ξlimu DAO contributor (see `TOKENOMICS.md` at https://github.com/elimu-ai/web3-wiki).
contract Contributors is IContributors, Ownable {
    mapping(address => uint256) private drips;

    event AmountUpdated(address indexed contributor, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function updateAmount(address contributor, uint256 amount) external onlyOwner {
        drips[contributor] = amount;
        emit AmountUpdated(contributor, amount);
    }

    function collectedViaDrips(address contributor) external view returns (uint256) {
        return drips[contributor];
    }
}
