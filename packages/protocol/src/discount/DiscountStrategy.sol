// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {IDiscountStrategy} from "./IDiscountStrategy.sol";
import {Shop} from "../Shop.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

abstract contract DiscountStrategy is IDiscountStrategy, AccessControl {
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
}
