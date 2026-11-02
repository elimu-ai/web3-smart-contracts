// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import { IPermissionCondition } from "@aragon/osx-commons-contracts/src/permission/condition/IPermissionCondition.sol";
import { PermissionCondition } from "@aragon/osx-commons-contracts/src/permission/condition/PermissionCondition.sol";
import { IRoles } from "@elimu-ai/dao-contracts/IRoles.sol";

contract RoleCondition is PermissionCondition {
    IPermissionCondition public immutable votingPowerCondition;
    IRoles public immutable roles;

    constructor(address votingPowerCondition_, address roles_) {
        votingPowerCondition = IPermissionCondition(votingPowerCondition_);
        roles = IRoles(roles_);
    }

    /// @inheritdoc IPermissionCondition
    function isGranted(address where, address who, bytes32 permissionId, bytes calldata data)
        public
        view
        override
        returns (bool)
    {
        // Existing Aragon OSx logic
        if (!votingPowerCondition.isGranted(where, who, permissionId, data)) {
            return false;
        }

        // New custom Ξlimu DAO logic
        return roles.isDaoAdministrator(who);
    }
}
