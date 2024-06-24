// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {RewardStrategy} from "../RewardStrategy.sol";

abstract contract ERC20RewardStrategy is RewardStrategy {
    using SafeERC20 for IERC20;

    IERC20 public shopToken;

    constructor(address shopAddress, address tokenAddress) RewardStrategy(shopAddress) {
        shopToken = IERC20(tokenAddress);
    }

    /// @dev Calculates the reward for the buyer based on the price and supply
    // Do not give reward if the shop does not have enough tokens, which also allows us to set artificial limit on the reward (e.g. only available for whoever claims the first 100 $DEGEN)
    function calculateReward(uint256 price, uint256 supply, address buyer) external view returns (uint256) {
        uint256 balance = shopToken.balanceOf(address(this));
        if (balance == 0) {
            return 0;
        }

        uint256 reward = _calculateReward(price, supply, buyer);
        if (shopToken.balanceOf(address(this)) < reward) {
            return 0;
        }
        return reward;
    }

    /// @dev Calculates the reward for the buyer based on a few purchase parameters
    function _calculateReward(uint256 price, uint256 supply, address buyer) internal view virtual returns (uint256);

    /// @dev Rewards the buyer with the given amount of tokens
    function _reward(address buyer, uint256 amount) internal override {
        shopToken.safeTransfer(buyer, amount);
    }

    /// @dev Withdraws the remaining tokens from the contract. For simplicity we just add a withdraw function here for the shop admins to withdraw the remaining tokens
    function withdraw() external onlyShopDefaultAdmin {
        shopToken.safeTransfer(msg.sender, shopToken.balanceOf(address(this)));
    }

    /// @dev Updates the shop token address for the reward strategy
    function updateShopToken(address tokenAddress) external onlyShopDefaultAdmin {
        shopToken = IERC20(tokenAddress);
    }
}
