// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {FeeShareStrategy} from "./FeeShareStrategy.sol";
import {IFeeShareStrategy} from "./IFeeShareStrategy.sol";

/// @dev Fee share strategy that takes a fixed percentage of the purchase price as fee for recipient
contract PercentageFeeShareStrategy is FeeShareStrategy {
    using Math for uint256;

    /// @dev The maximum value for fee basis points.
    uint256 public constant MAX_BPS = 10_000;

    /// @dev The fee basis points for the platform. 10000 = 100%
    uint256 public bps;

    constructor(address _shopAddress, uint256 _bps) FeeShareStrategy(_shopAddress) {
        require(bps <= MAX_BPS, "bps exceeds MAX_BPS");
        bps = _bps;
    }

    /// @inheritdoc IFeeShareStrategy
    function calculateFee(uint256 price, address) external view override returns (uint256) {
        return Math.mulDiv(price, bps, MAX_BPS);
    }

    /// @dev Sets the fee percentage for the fee calculation
    function setBps(uint256 _bps) external onlyShopDefaultAdmin {
        require(_bps <= MAX_BPS, "bps exceeds MAX_BPS");
        bps = _bps;
    }

    /// @inheritdoc IFeeShareStrategy
    function getType() external pure override returns (string memory) {
        return "PERCENTAGE_FEE_SHARE";
    }
}
