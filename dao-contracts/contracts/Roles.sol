// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import { IRoles } from "@elimu-ai/dao-contracts/IRoles.sol";
import { IContributors } from "@elimu-ai/dao-contracts/IContributors.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice This smart contract defines the contributor roles used in the Ξlimu DAO (see `TOKENOMICS.md` at https://github.com/elimu-ai/web3-wiki).
contract Roles is IRoles, Ownable {
    IERC20 public elimuToken;
    IERC20 public gElimuToken;
    IContributors public contributors;
    
    constructor(address _elimuToken, address _gElimuToken, address _contributors) Ownable(msg.sender) {
        elimuToken = IERC20(_elimuToken);
        gElimuToken = IERC20(_gElimuToken);
        contributors = IContributors(_contributors);
    }

    function isDaoProposer(address contributor) external view returns (bool) {
        uint256 tokenBalance = getCombinedTokenBalance(contributor);
        uint256 collectedSum = contributors.collectedViaDrips(contributor);
        return (tokenBalance >= 387_000 ether) && (collectedSum >= 387_000 ether);
    }

    function isDaoOperator(address contributor) external view returns (bool) {
        uint256 tokenBalance = getCombinedTokenBalance(contributor);
        uint256 collectedSum = contributors.collectedViaDrips(contributor);
        return (tokenBalance >= 1_935_000 ether) && (collectedSum >= 1_935_000 ether);
    }

    function isDaoAdministrator(address contributor) external view returns (bool) {
        uint256 tokenBalance = getCombinedTokenBalance(contributor);
        uint256 collectedSum = contributors.collectedViaDrips(contributor);
        return (tokenBalance >= 3_870_000 ether) && (collectedSum >= 3_870_000 ether);
    }

    function getCombinedTokenBalance(address contributor) public view returns (uint256) {
        return elimuToken.balanceOf(contributor) + gElimuToken.balanceOf(contributor);
    }
}
