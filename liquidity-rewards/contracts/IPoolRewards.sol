// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

interface IPoolRewards {

    function depositPoolTokens(uint256 amount) external;

    function withdrawPoolTokens(uint256 amount) external;

    function claimableRewards(address account) external returns (uint256);

    function claimRewards() external;

    function withdrawPoolTokensAndClaimRewards() external;
}
