// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/* This contract will take care of user stake balances and total user stakes.
this is a base contract for PoolRewards contracts.
 */
contract PoolTokenWrapper {
    using SafeERC20 for IERC20;

    /**
     * Pool token ERC20 token interface.
     */
    IERC20 public poolToken;
    
    /**
     * User balances of the pool token.
     */
    mapping(address => uint256) private _balances;

    /**
     * Returns the pool token balance of an account.
     */
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    /**
     * Deposit pool tokens and update _balances variable. Will be called
     * by a child contract.
     */
    function depositPoolTokens(uint256 amount) public virtual {
        _balances[msg.sender] = _balances[msg.sender] + amount;
        poolToken.safeTransferFrom(msg.sender, address(this), amount);
    }

    /**
     * Withdraw pool tokens and update _balances variable. Will be called
     * by a child contract.
     */
    function withdrawPoolTokens(uint256 amount) public virtual {
        _balances[msg.sender] = _balances[msg.sender] - amount;
        poolToken.safeTransfer(msg.sender, amount);
    }
}
