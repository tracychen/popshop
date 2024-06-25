// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {IDiscountStrategy} from "../IDiscountStrategy.sol";
import {ERC721DiscountStrategy} from "./ERC721DiscountStrategy.sol";

/// @dev Discount strategy that gives a discount based on the ERC721 min token balance of the buyer
contract MinERC721DiscountStrategy is ERC721DiscountStrategy {
    using Math for uint256;

    /// @dev The maximum value for fee basis points.
    uint256 public constant MAX_BPS = 10_000;

    /// @dev The fee basis points for the platform. 10000 = 100%
    uint256 public bps;

    /// @dev The minimum balance required to get the discount
    uint256 public minBalance;

    constructor(address shopAddress, address tokenAddress, uint256 _bps, uint256 _minBalance)
        ERC721DiscountStrategy(shopAddress, tokenAddress)
    {
        require(bps <= MAX_BPS, "bps exceeds MAX_BPS");
        bps = _bps;
        minBalance = _minBalance;
    }

    /// @inheritdoc IDiscountStrategy
    function calculateDiscount(uint256 price, address buyer) external view returns (uint256) {
        uint256 balance = shopToken.balanceOf(buyer);
        if (balance < minBalance) {
            return 0;
        }
        return Math.mulDiv(price, bps, MAX_BPS);
    }

    /// @dev Sets the fee percentage for the fee calculation
    function setBps(uint256 _bps) external onlyShopDefaultAdmin {
        require(_bps <= MAX_BPS, "bps exceeds MAX_BPS");
        bps = _bps;
    }

    /// @dev Sets the minimum balance required to get the discount
    function setMinBalance(uint256 _minBalance) external onlyShopDefaultAdmin {
        require(_minBalance > 0, "minBalance must be greater than 0");
        minBalance = _minBalance;
    }

    /// @inheritdoc IDiscountStrategy
    function getType() external pure returns (string memory) {
        return "MIN_ERC721_DISCOUNT";
    }
}
