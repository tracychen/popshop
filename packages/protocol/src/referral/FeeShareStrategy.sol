// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {IFeeShareStrategy} from "./IFeeShareStrategy.sol";
import {Shop} from "../Shop.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

abstract contract FeeShareStrategy is IFeeShareStrategy, AccessControl {
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

    /// @dev Returns the type of the reward strategy for popshop* internal use
    function getType() external pure virtual returns (string memory);
}
