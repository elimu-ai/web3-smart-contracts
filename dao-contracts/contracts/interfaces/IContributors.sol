// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

interface IContributors {
    function collectedViaDrips(address) external view returns (uint256);
}
