// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IFeeShareStrategy {
    /// @dev Calculate the fee for the fee share recipient
    function calculateFee(uint256 price, address recipient) external view returns (uint256);
    /// @dev Returns the type of the strategy for popshop* internal use
    function getType() external pure returns (string memory);
}
