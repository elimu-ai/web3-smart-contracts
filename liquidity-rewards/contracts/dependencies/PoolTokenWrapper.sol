// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/* This contract will take care of user stake balances and total user stakes.
this is a base contract for PoolRewards contracts.
 */
contract PoolTokenWrapper {
    using SafeERC20 for IERC20;

    IERC20 public poolToken;

    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function depositPoolTokens(uint256 amount) public virtual {
        _totalSupply = _totalSupply + amount;
        _balances[msg.sender] = _balances[msg.sender] + amount;
        poolToken.safeTransferFrom(msg.sender, address(this), amount);
    }

    function withdrawPoolTokens(uint256 amount) public virtual {
        _totalSupply = _totalSupply - amount;
        _balances[msg.sender] = _balances[msg.sender] - amount;
        poolToken.safeTransfer(msg.sender, amount);
    }
}
