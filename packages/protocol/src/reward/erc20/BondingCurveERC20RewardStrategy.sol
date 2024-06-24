// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {ERC20RewardStrategy} from "./ERC20RewardStrategy.sol";
import {IRewardStrategy} from "../IRewardStrategy.sol";

/// @dev Reward strategy that gives a reward to the buyer on each purchase based on the price and the supply
/// @dev The reward is calculated as `baseReward / (1 + decayConstant * supply / price)`
contract BondingCurveERC20RewardStrategy is ERC20RewardStrategy {
    using Math for uint256;

    uint256 public decayConstant;
    uint256 public baseReward;

    constructor(address shopAddress, address tokenAddress, uint256 _decayConstant, uint256 _baseReward)
        ERC20RewardStrategy(shopAddress, tokenAddress)
    {
        decayConstant = _decayConstant;
        baseReward = _baseReward;
    }

    /// @dev Calculates the reward using a simple function on the price and supply to approximate a decay effect where the reward decreases as the supply increases or as the price decreases
    function _calculateReward(uint256 price, uint256 supply, address) internal view override returns (uint256) {
        uint256 factor = Math.mulDiv(decayConstant, supply, price);
        return baseReward / (1 + factor);
    }

    /// @dev Sets the decay constant for the reward calculation
    function setDecayConstant(uint256 _decayConstant) external onlyShopDefaultAdmin {
        decayConstant = _decayConstant;
    }

    /// @dev Sets the base reward for the reward calculation
    function setBaseReward(uint256 _baseReward) external onlyShopDefaultAdmin {
        baseReward = _baseReward;
    }

    /// @inheritdoc IRewardStrategy
    function getType() external pure override returns (string memory) {
        return "BONDING_CURVE_ERC20_REWARD";
    }
}
