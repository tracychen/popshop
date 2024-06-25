// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {EnumerableMap} from "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {DiscountStrategy} from "../DiscountStrategy.sol";
import {IDiscountStrategy} from "../IDiscountStrategy.sol";

/// @dev Discount strategy that allows for a discount for a specific buyers on the allowlist and allows each buyer to have a different discount
contract AllowlistDiscountStrategy is DiscountStrategy {
    using EnumerableMap for EnumerableMap.AddressToUintMap;
    using Math for uint256;

    /// @dev The maximum value for fee basis points.
    uint256 public constant MAX_BPS = 10_000;

    /// @dev Addresses that are allowed to receive the reward and their respective discount amount
    /// Keep this simple for now as PoC and follow up for scaling later
    EnumerableMap.AddressToUintMap private allowlistBps;

    constructor(address shopAddress) DiscountStrategy(shopAddress) {}

    /// @inheritdoc IDiscountStrategy
    function calculateDiscount(uint256 price, address buyer) external view returns (uint256) {
        (bool exists, uint256 addressBps) = allowlistBps.tryGet(buyer);
        if (exists) {
            return Math.mulDiv(price, addressBps, MAX_BPS);
        }
        return 0;
    }

    /// @dev Adds addresses to the allowlist with a specific discount
    function addToAllowlist(address[] memory addresses, uint256 addressBps) public onlyShopDefaultAdmin {
        for (uint256 i = 0; i < addresses.length; i++) {
            allowlistBps.set(addresses[i], addressBps);
        }
    }

    /// @dev Removes addresses from the allowlist
    function removeFromAllowlist(address[] memory addresses) public onlyShopDefaultAdmin {
        for (uint256 i = 0; i < addresses.length; i++) {
            allowlistBps.remove(addresses[i]);
        }
    }

    /// @dev Smol brain getter for the allowlist for now, returns the addresses and their respective discounts
    function getAllowlist() external view returns (address[] memory, uint256[] memory) {
        uint256 length = allowlistBps.length();
        address[] memory addresses = new address[](length);
        uint256[] memory discounts = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            (address addr, uint256 discount) = allowlistBps.at(i);
            addresses[i] = addr;
            discounts[i] = discount;
        }

        return (addresses, discounts);
    }

    /// @dev Getter for whether a buyer is on the allowlist
    function isAllowlisted(address buyer) external view returns (bool) {
        return allowlistBps.contains(buyer);
    }

    /// @dev Getter for the discount of a specific buyer
    function getBps(address buyer) external view returns (uint256) {
        (bool exists, uint256 addressBps) = allowlistBps.tryGet(buyer);
        if (exists) {
            return addressBps;
        }
        return 0;
    }

    /// @dev Getter for the length of the allowlist
    function getAllowlistLength() external view returns (uint256) {
        return allowlistBps.length();
    }

    /// @inheritdoc IDiscountStrategy
    function getType() external pure override returns (string memory) {
        return "ALLOWLIST_DISCOUNT";
    }
}
