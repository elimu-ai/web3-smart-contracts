// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import { IPermissionCondition } from "@aragon/osx-commons-contracts/src/permission/condition/IPermissionCondition.sol";

contract DummyPermissionCondition is IPermissionCondition {
    function isGranted(address, address, bytes32, bytes calldata) external pure returns (bool) {
        return true;
    }
}
