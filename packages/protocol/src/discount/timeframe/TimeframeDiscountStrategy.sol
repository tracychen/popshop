// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {DiscountStrategy} from "../DiscountStrategy.sol";
import {IDiscountStrategy} from "../IDiscountStrategy.sol";

/// @dev Discount strategy that applies a discount based on a start and end timestamp timeframe
contract TimeframeDiscountStrategy is DiscountStrategy {
    using Math for uint256;

    /// @dev The maximum value for fee basis points.
    uint256 public constant MAX_BPS = 10_000;

    /// @dev The fee basis points for the platform. 10000 = 100%
    uint256 public bps;

    /// @dev The start timestamp for the fee to be applied
    uint256 public startTimestamp;

    /// @dev The end timestamp for the fee to be applied
    uint256 public endTimestamp;

    constructor(address _shopAddress, uint256 _bps, uint256 _startTimestamp, uint256 _endTimestamp)
        DiscountStrategy(_shopAddress)
    {
        require(bps <= MAX_BPS, "bps exceeds MAX_BPS");
        bps = _bps;
        require(_startTimestamp < _endTimestamp, "startTimestamp must be before endTimestamp");
        startTimestamp = _startTimestamp;
        endTimestamp = _endTimestamp;
    }

    /// @inheritdoc IDiscountStrategy
    function calculateDiscount(uint256 price, address) external view returns (uint256) {
        if (block.timestamp < startTimestamp || block.timestamp > endTimestamp) {
            return 0;
        }

        return Math.mulDiv(price, bps, MAX_BPS);
    }

    /// @dev Sets the fee percentage for the fee calculation
    function setBps(uint256 _bps) external onlyShopDefaultAdmin {
        require(_bps <= MAX_BPS, "bps exceeds MAX_BPS");
        bps = _bps;
    }

    /// @dev Sets the start timestamp for the fee to be applied
    function setStartTimestamp(uint256 _startTimestamp) external onlyShopDefaultAdmin {
        require(_startTimestamp < endTimestamp, "startTimestamp must be before endTimestamp");
        startTimestamp = _startTimestamp;
    }

    /// @dev Sets the end timestamp for the fee to be applied
    function setEndTimestamp(uint256 _endTimestamp) external onlyShopDefaultAdmin {
        require(startTimestamp < _endTimestamp, "startTimestamp must be before endTimestamp");
        endTimestamp = _endTimestamp;
    }
    /// @inheritdoc IDiscountStrategy

    function getType() external pure override returns (string memory) {
        return "TIMEFRAME_DISCOUNT";
    }
}
