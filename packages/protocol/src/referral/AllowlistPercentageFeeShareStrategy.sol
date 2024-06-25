// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {FeeShareStrategy} from "./FeeShareStrategy.sol";
import {IFeeShareStrategy} from "./IFeeShareStrategy.sol";

/// @dev Fee share strategy that gives a fixed amount of tokens to the buyer on each purchase if they are in the allowlist
contract AllowlistPercentageFeeShareStrategy is FeeShareStrategy {
    using EnumerableSet for EnumerableSet.AddressSet;
    using Math for uint256;

    /// @dev The maximum value for fee basis points.
    uint256 public constant MAX_BPS = 10_000;

    /// @dev The fee basis points for the platform. 10000 = 100%
    uint256 public bps;

    /// @dev Addresses that are allowed to receive the reward
    /// Keep this simple for now as PoC and follow up for scaling later
    EnumerableSet.AddressSet private allowlist;

    constructor(address shopAddress, uint256 _bps) FeeShareStrategy(shopAddress) {
        bps = _bps;
    }

    /// @inheritdoc IFeeShareStrategy
    function calculateFee(uint256 price, address recipient) external view override returns (uint256) {
        if (allowlist.contains(recipient)) {
            return Math.mulDiv(price, bps, MAX_BPS);
        }
        return 0;
    }

    /// @dev Adds addresses to the allowlist
    function addToAllowlist(address[] memory addresses) public onlyShopDefaultAdmin {
        for (uint256 i = 0; i < addresses.length; i++) {
            allowlist.add(addresses[i]);
        }
    }

    /// @dev Removes addresses from the allowlist
    function removeFromAllowlist(address[] memory addresses) public onlyShopDefaultAdmin {
        for (uint256 i = 0; i < addresses.length; i++) {
            allowlist.remove(addresses[i]);
        }
    }

    /// @dev Sets the fee percentage for the fee calculation
    function setBps(uint256 _bps) external onlyShopDefaultAdmin {
        require(_bps <= MAX_BPS, "bps exceeds MAX_BPS");
        bps = _bps;
    }

    /// @dev Smol brain getter for the allowlist for now
    function getAllowlist() external view returns (address[] memory) {
        address[] memory addresses = new address[](allowlist.length());
        for (uint256 i = 0; i < allowlist.length(); i++) {
            addresses[i] = allowlist.at(i);
        }
        return addresses;
    }

    function isAllowlisted(address buyer) external view returns (bool) {
        return allowlist.contains(buyer);
    }

    function getAllowlistLength() external view returns (uint256) {
        return allowlist.length();
    }

    /// @inheritdoc IFeeShareStrategy
    function getType() external pure override returns (string memory) {
        return "ALLOWLIST_PERCENTAGE_FEE_SHARE";
    }
}
