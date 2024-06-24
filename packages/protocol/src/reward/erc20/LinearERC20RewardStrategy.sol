// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ERC20RewardStrategy} from "./ERC20RewardStrategy.sol";
import {IRewardStrategy} from "../IRewardStrategy.sol";

/// @dev Reward strategy that gives a linear amount of tokens to the buyer on each purchase based on the price and a multiplier
/// @dev The reward is calculated as `price * multiplier`
contract LinearERC20RewardStrategy is ERC20RewardStrategy {
    uint256 public multiplier;

    constructor(address shopAddress, address tokenAddress, uint256 _multiplier)
        ERC20RewardStrategy(shopAddress, tokenAddress)
    {
        multiplier = _multiplier;
    }

    /// @inheritdoc ERC20RewardStrategy
    function _calculateReward(uint256 price, uint256, address) internal view override returns (uint256) {
        return price * multiplier;
    }

    /// @dev Sets the multiplier for the reward calculation
    function setMultiplier(uint256 _multiplier) external onlyShopDefaultAdmin {
        multiplier = _multiplier;
    }

    /// @inheritdoc IRewardStrategy
    function getType() external pure override returns (string memory) {
        return "LINEAR_ERC20_REWARD";
    }
}
