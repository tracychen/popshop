// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {DiscountStrategy} from "../DiscountStrategy.sol";

abstract contract ERC721DiscountStrategy is DiscountStrategy {
    IERC721 public shopToken;

    constructor(address shopAddress, address tokenAddress) DiscountStrategy(shopAddress) {
        shopToken = IERC721(tokenAddress);
    }

    /// @dev Updates the shop token address for the reward strategy
    function updateShopToken(address tokenAddress) external onlyShopDefaultAdmin {
        shopToken = IERC721(tokenAddress);
    }
}
