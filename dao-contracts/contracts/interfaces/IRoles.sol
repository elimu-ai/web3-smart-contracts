// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IRoles {
    function isDaoProposer(address) external view returns (bool);
    function isDaoOperator(address) external view returns (bool);
    function isDaoAdministrator(address) external view returns (bool);
}
