// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./ShopRegistry.sol";
import "./Shop.sol";

contract ShopFactory {
    ShopRegistry public registry;
    address public platformAddress;
    uint256 public platformFee;

    event ShopCreated(address shopAddress, string shopMetadataURI, address initialAdmin);

    constructor(address registryAddress, address _platformAddress, uint256 _platformFee) {
        registry = ShopRegistry(registryAddress);
        platformAddress = _platformAddress;
        platformFee = _platformFee;
    }

    function createShop(string memory shopMetadataURI, address initialAdmin) public returns (address) {
        Shop newShop = new Shop(shopMetadataURI, address(registry), platformAddress, platformFee, initialAdmin);
        registry.registerShop(address(newShop), shopMetadataURI, initialAdmin);

        emit ShopCreated(address(newShop), shopMetadataURI, initialAdmin);
        return address(newShop);
    }
}
