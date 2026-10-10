// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import { SchemaResolver } from "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";
import { IEAS, Attestation } from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import { IRoles } from "@elimu-ai/dao-contracts/IRoles.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/// @title RoleResolver
/// @notice A schema resolver that checks whether the attestation is from an Ξlimu DAO operator
contract RoleResolver is SchemaResolver, Ownable {
    IRoles public roles;

    event RolesUpdated(address roles);

    constructor(IEAS eas, address roles_) SchemaResolver(eas) Ownable(msg.sender) {
        roles = IRoles(roles_);
    }

    function updateRoles(address roles_) public onlyOwner {
        roles = IRoles(roles_);
        emit RolesUpdated(roles_);
    }

    function onAttest(Attestation calldata attestation, uint256 /*value*/) internal view override returns (bool) {
        return roles.isDaoOperator(attestation.attester);
    }

    function onRevoke(Attestation calldata /*attestation*/, uint256 /*value*/) internal pure override returns (bool) {
        return true;
    }
}
