// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {EnumerableMap} from "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {DiscountStrategy} from "../DiscountStrategy.sol";
import {IDiscountStrategy} from "../IDiscountStrategy.sol";

/// @dev Discount strategy that allows for a discount for a specific buyers on the allowlist and allows each buyer to have a different discount
contract PriceThresholdDiscountStrategy is DiscountStrategy {
    using EnumerableMap for EnumerableMap.UintToUintMap;
    using Math for uint256;

    /// @dev The maximum value for fee basis points.
    uint256 public constant MAX_BPS = 10_000;

    /// @dev Thresholds for the discount to be applied and their respective discount amount
    /// Keep this simple for now as PoC and follow up for scaling later
    EnumerableMap.UintToUintMap private thresholdBps;

    constructor(address shopAddress) DiscountStrategy(shopAddress) {}

    /// @inheritdoc IDiscountStrategy
    function calculateDiscount(uint256 price, address) external view returns (uint256) {
        uint256[] memory thresholds = thresholdBps.keys();
        uint256 maxBps = 0;
        for (uint256 i = 0; i < thresholds.length; i++) {
            if (price >= thresholds[i]) {
                maxBps = Math.max(maxBps, thresholdBps.get(thresholds[i]));
            }
        }

        return Math.mulDiv(price, maxBps, MAX_BPS);
    }

    /// @dev Adds a threshold to the discount strategy with a specific discount
    function setThresholdBps(uint256 threshold, uint256 addressBps) public onlyShopDefaultAdmin {
        thresholdBps.set(threshold, addressBps);
    }

    /// @dev Removes a threshold from the discount strategy
    function removeThreshold(uint256 threshold) public onlyShopDefaultAdmin {
        thresholdBps.remove(threshold);
    }

    /// @dev Smol brain getter for the allowlist for now, returns the addresses and their respective discounts
    function getThresholdBpses() external view returns (uint256[] memory, uint256[] memory) {
        uint256 length = thresholdBps.length();
        uint256[] memory thresholds = new uint256[](length);
        uint256[] memory discounts = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            (uint256 threshold, uint256 discount) = thresholdBps.at(i);
            thresholds[i] = threshold;
            discounts[i] = discount;
        }

        return (thresholds, discounts);
    }

    function getNumThresholds() external view returns (uint256) {
        return thresholdBps.length();
    }

    /// @inheritdoc IDiscountStrategy
    function getType() external pure override returns (string memory) {
        return "ALLOWLIST_DISCOUNT";
    }
}
