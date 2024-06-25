// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {IDiscountStrategy} from "../IDiscountStrategy.sol";
import {ERC1155DiscountStrategy} from "./ERC1155DiscountStrategy.sol";

/// @dev Discount strategy that gives a discount based on whether the buyer owns any of a set of token ids of an ERC1155 token
contract TokenIdAllowlistERC721DiscountStrategy is ERC1155DiscountStrategy {
    using EnumerableSet for EnumerableSet.UintSet;

    using Math for uint256;

    /// @dev The maximum value for fee basis points.
    uint256 public constant MAX_BPS = 10_000;

    /// @dev The fee basis points for the platform. 10000 = 100%
    uint256 public bps;

    /// @dev The minimum token balance required to get the discount
    uint256 public minBalance;

    /// @dev Token ids that are allowed to receive the discount
    /// Keep this simple for now as PoC and follow up for scaling later
    EnumerableSet.UintSet private tokenIdAllowlist;

    constructor(address shopAddress, address tokenAddress, uint256 _bps)
        ERC1155DiscountStrategy(shopAddress, tokenAddress)
    {
        require(bps <= MAX_BPS, "bps exceeds MAX_BPS");
        bps = _bps;
        minBalance = 0;
    }

    /// @inheritdoc IDiscountStrategy
    function calculateDiscount(uint256 price, address buyer) external view returns (uint256) {
        for (uint256 i = 0; i < tokenIdAllowlist.length(); i++) {
            if (shopToken.balanceOf(buyer, tokenIdAllowlist.at(i)) >= minBalance) {
                return Math.mulDiv(price, bps, MAX_BPS);
            }
        }

        return 0;
    }

    /// @dev Adds addresses to the allowlist
    function addToAllowlist(uint256[] memory tokenIds) public onlyShopDefaultAdmin {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            tokenIdAllowlist.add(tokenIds[i]);
        }
    }

    /// @dev Removes addresses from the allowlist
    function removeFromAllowlist(uint256[] memory tokenIds) public onlyShopDefaultAdmin {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            tokenIdAllowlist.remove(tokenIds[i]);
        }
    }

    /// @dev Smol brain getter for the allowlist for now
    function getAllowlist() external view returns (uint256[] memory) {
        uint256[] memory tokenIds = new uint256[](tokenIdAllowlist.length());
        for (uint256 i = 0; i < tokenIdAllowlist.length(); i++) {
            tokenIds[i] = tokenIdAllowlist.at(i);
        }
        return tokenIds;
    }

    function isAllowlisted(uint256 tokenId) external view returns (bool) {
        return tokenIdAllowlist.contains(tokenId);
    }

    function getAllowlistLength() external view returns (uint256) {
        return tokenIdAllowlist.length();
    }

    /// @dev Sets the fee percentage for the fee calculation
    function setBps(uint256 _bps) external onlyShopDefaultAdmin {
        require(_bps <= MAX_BPS, "bps exceeds MAX_BPS");
        bps = _bps;
    }

    /// @dev Sets the minimum balance required to get the discount
    function setMinBalance(uint256 _minBalance) external onlyShopDefaultAdmin {
        minBalance = _minBalance;
    }

    /// @inheritdoc IDiscountStrategy
    function getType() external pure returns (string memory) {
        return "TOKEN_ID_ALLOWLIST_ERC1155_DISCOUNT";
    }
}
