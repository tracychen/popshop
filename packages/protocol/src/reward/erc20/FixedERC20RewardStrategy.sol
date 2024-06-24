// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ERC20RewardStrategy} from "./ERC20RewardStrategy.sol";
import {IRewardStrategy} from "../IRewardStrategy.sol";

/// @dev Reward is calculated as a fixed amount of tokens
contract FixedERC20RewardStrategy is ERC20RewardStrategy {
    uint256 public numTokens;

    constructor(address shopAddress, address tokenAddress, uint256 _numTokens)
        ERC20RewardStrategy(shopAddress, tokenAddress)
    {
        numTokens = _numTokens;
    }

    /// @inheritdoc ERC20RewardStrategy
    function _calculateReward(uint256, uint256, address) internal view override returns (uint256) {
        return numTokens;
    }

    /// @dev Sets the number of tokens to reward to the buyer
    function setNumTokens(uint256 _numTokens) external onlyShopDefaultAdmin {
        numTokens = _numTokens;
    }

    /// @inheritdoc IRewardStrategy
    function getType() external pure override returns (string memory) {
        return "FIXED_ERC20_REWARD";
    }
}
