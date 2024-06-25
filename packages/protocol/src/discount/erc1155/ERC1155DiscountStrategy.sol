// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {DiscountStrategy} from "../DiscountStrategy.sol";

abstract contract ERC1155DiscountStrategy is DiscountStrategy {
    IERC1155 public shopToken;

    constructor(address shopAddress, address tokenAddress) DiscountStrategy(shopAddress) {
        shopToken = IERC1155(tokenAddress);
    }

    /// @dev Updates the shop token address for the reward strategy
    function updateShopToken(address tokenAddress) external onlyShopDefaultAdmin {
        shopToken = IERC1155(tokenAddress);
    }
}
