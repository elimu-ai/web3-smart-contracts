// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/* This contract will take care of user stake balances and total user stakes.
this is a base contract for PoolRewards contracts.
 */
contract PoolTokenWrapper {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /**
     * Pool token ERC20 token interface.
     */
    IERC20 public poolToken;

    /**
     * Keeps track of the total supply of the pool token deposited into this contract.
     * This will reduce the amount of calculations vs calling a balanceOf method.
     */
    uint256 private _totalSupply;
    
    /**
     * User balances of the pool token.
     */
    mapping(address => uint256) private _balances;

    /**
     * Returns value of the _totalSupply variable.
     */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /**
     * Returns the pool token balance of an account.
     */
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    /**
     * Deposit pool tokens and update _balances and _totalSupply variables. Will be called
     * by a child contract.
     */
    function depositPoolTokens(uint256 amount) public virtual {
        _totalSupply = _totalSupply.add(amount);
        _balances[msg.sender] = _balances[msg.sender].add(amount);
        poolToken.safeTransferFrom(msg.sender, address(this), amount);
    }

    /**
     * Withdraw pool tokens and update _balances and _totalSupply variables. Will be called
     * by a child contract.
     */
    function withdrawPoolTokens(uint256 amount) public virtual {
        _totalSupply = _totalSupply.sub(amount);
        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        poolToken.safeTransfer(msg.sender, amount);
    }
}
