// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {ERC20RewardStrategy} from "./ERC20RewardStrategy.sol";
import {IRewardStrategy} from "../IRewardStrategy.sol";

/// @dev Reward strategy that gives a fixed amount of tokens to the buyer on each purchase if they are in the allowlist
/// @dev Reward is calculated as a fixed amount of tokens if the buyer is in the allowlist
contract AllowlistFixedERC20RewardStrategy is ERC20RewardStrategy {
    using EnumerableSet for EnumerableSet.AddressSet;

    uint256 public numTokens;

    /// @dev Addresses that are allowed to receive the reward
    /// Keep this simple for now as PoC and follow up for scaling later
    EnumerableSet.AddressSet private allowlist;

    constructor(address shopAddress, address tokenAddress, uint256 _numTokens)
        ERC20RewardStrategy(shopAddress, tokenAddress)
    {
        numTokens = _numTokens;
    }

    /// @dev Adds addresses to the allowlist
    function addToAllowlist(address[] memory addresses) public onlyShopDefaultAdmin {
        for (uint256 i = 0; i < addresses.length; i++) {
            allowlist.add(addresses[i]);
        }
    }

    /// @dev Removes addresses from the allowlist
    function removeFromAllowlist(address[] memory addresses) public onlyShopDefaultAdmin {
        for (uint256 i = 0; i < addresses.length; i++) {
            allowlist.remove(addresses[i]);
        }
    }

    /// @dev Checks if an address is in the allowlist
    function isAllowlisted(address buyer) external view returns (bool) {
        return allowlist.contains(buyer);
    }

    /// @dev Smol brain getter for the allowlist for now
    function getAllowlist() external view returns (address[] memory) {
        address[] memory addresses = new address[](allowlist.length());
        for (uint256 i = 0; i < allowlist.length(); i++) {
            addresses[i] = allowlist.at(i);
        }
        return addresses;
    }

    /// @dev Returns the number of addresses in the allowlist
    function getAllowlistLength() external view returns (uint256) {
        return allowlist.length();
    }

    /// @dev Sets the number of tokens to reward to the buyer
    function setNumTokens(uint256 _numTokens) external onlyShopDefaultAdmin {
        numTokens = _numTokens;
    }

    /// @inheritdoc IRewardStrategy
    function getType() external pure override returns (string memory) {
        return "ALLOWLIST_FIXED_ERC20_REWARD";
    }

    /// @dev Calculates the reward as a fixed amount of tokens if the buyer is in the allowlist or 0 otherwise
    function _calculateReward(uint256, uint256, address buyer) internal view override returns (uint256) {
        if (allowlist.contains(buyer)) {
            return numTokens;
        }
        return 0;
    }
}
