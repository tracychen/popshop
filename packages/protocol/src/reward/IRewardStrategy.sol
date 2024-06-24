// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IRewardStrategy {
    /// @dev Calculate the reward for the buyer
    function calculateReward(uint256 price, uint256 supply, address buyer) external view returns (uint256);
    /// @dev Reward the buyer with the given amount
    function reward(address buyer, uint256 amount) external;
    /// @dev Returns the type of the reward strategy for popshop* internal use
    function getType() external pure returns (string memory);
}
