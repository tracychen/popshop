// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IDiscountStrategy {
    /// @dev Calculate the discount for the buyer
    function calculateDiscount(uint256 price, address buyer) external view returns (uint256);
    /// @dev Returns the type of the strategy for popshop* internal use
    function getType() external pure returns (string memory);
}
