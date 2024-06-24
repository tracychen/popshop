// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ShopRegistry is Ownable {
    struct ShopInfo {
        address shopAddress;
        string shopMetadataURI;
    }

    ShopInfo[] public shops;
    mapping(address => ShopInfo) private shopByAddress;
    mapping(address => ShopInfo[]) private adminToShops;
    mapping(address => mapping(address => bool)) private isShopAdmin;

    constructor() Ownable(msg.sender) {}

    function registerShop(address shopAddress, string memory shopMetadataURI, address initialAdmin) public {
        // Check if the shop is already registered
        require(shopByAddress[shopAddress].shopAddress == address(0), "Shop already registered");
        // check owner is not initial admin
        require(owner() != initialAdmin, "Owner and initial admin should be different");
        ShopInfo memory newShop = ShopInfo({shopAddress: shopAddress, shopMetadataURI: shopMetadataURI});

        shops.push(newShop);
        shopByAddress[shopAddress] = newShop;
        adminToShops[initialAdmin].push(newShop);
        adminToShops[owner()].push(newShop);
        isShopAdmin[shopAddress][initialAdmin] = true;
        isShopAdmin[shopAddress][owner()] = true;
    }

    function addShopAdmin(address shopAddress, address admin) public {
        require(msg.sender == shopAddress, "Only shop can add admin in registry");

        ShopInfo memory shopInfo = shopByAddress[shopAddress];
        adminToShops[admin].push(shopInfo);
        isShopAdmin[shopAddress][admin] = true;
    }

    function removeShopAdmin(address shopAddress, address admin) public {
        require(msg.sender == shopAddress, "Only shop can remove admin in registry");

        for (uint256 i = 0; i < adminToShops[admin].length; i++) {
            if (adminToShops[admin][i].shopAddress == shopAddress) {
                adminToShops[admin][i] = adminToShops[admin][adminToShops[admin].length - 1];
                adminToShops[admin].pop();
                isShopAdmin[shopAddress][admin] = false;
                break;
            }
        }
    }

    function getShops() public view returns (ShopInfo[] memory) {
        return shops;
    }

    function getShopsByAdmin(address admin) public view returns (ShopInfo[] memory) {
        return adminToShops[admin];
    }

    function getShop(address shopAddress) public view returns (ShopInfo memory) {
        return shopByAddress[shopAddress];
    }
}
