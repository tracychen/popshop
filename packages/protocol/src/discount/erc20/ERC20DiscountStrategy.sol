// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {DiscountStrategy} from "../DiscountStrategy.sol";

abstract contract ERC20DiscountStrategy is DiscountStrategy {
    IERC20 public shopToken;

    constructor(address shopAddress, address tokenAddress) DiscountStrategy(shopAddress) {
        shopToken = IERC20(tokenAddress);
    }

    /// @dev Updates the shop token address for the reward strategy
    function updateShopToken(address tokenAddress) external onlyShopDefaultAdmin {
        shopToken = IERC20(tokenAddress);
    }
}
