// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {IRewardStrategy} from "./IRewardStrategy.sol";
import {Shop} from "../Shop.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

abstract contract RewardStrategy is IRewardStrategy, AccessControl {
    address internal shopAddress;

    constructor(address _shopAddress) {
        shopAddress = _shopAddress;
    }

    modifier onlyShop() {
        require(shopAddress == msg.sender);
        _;
    }

    modifier onlyShopDefaultAdmin() {
        require(Shop(shopAddress).hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Only shop default admin can call this");
        _;
    }

    /// @dev Calculates the reward amount for a buyer
    function reward(address buyer, uint256 amount) public onlyShop {
        _reward(buyer, amount);
    }

    function _reward(address buyer, uint256 amount) internal virtual;

    /// @dev Returns the type of the reward strategy for popshop* internal use
    function getType() external pure virtual returns (string memory);
}
