// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {AttestationAccessControl} from "verifications/abstracts/AttestationAccessControl.sol";
import {IAttestationIndexer} from "verifications/interfaces/IAttestationIndexer.sol";
import {Attestation} from "eas-contracts/IEAS.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {DiscountStrategy} from "../DiscountStrategy.sol";
import {IDiscountStrategy} from "../IDiscountStrategy.sol";

/// @dev Discount strategy that applies a discount if the user has a valid EAS attestation
contract EASAttestationDiscountStrategy is DiscountStrategy, AttestationAccessControl {
    using Math for uint256;

    /// @dev The maximum value for fee basis points.
    uint256 public constant MAX_BPS = 10_000;

    /// @dev The fee basis points for the platform. 10000 = 100%
    uint256 public bps;

    /// @dev The schema uid for the EAS attestation
    bytes32 public schemaUid;

    constructor(address _shopAddress, uint256 _bps, bytes32 _schemaUid, address indexerAddress)
        DiscountStrategy(_shopAddress)
    {
        require(bps <= MAX_BPS, "bps exceeds MAX_BPS");
        require(_schemaUid != 0, "schemaUid must be set");
        require(indexerAddress != address(0), "indexerAddress must be set");
        bps = _bps;
        schemaUid = _schemaUid;
        _setIndexer(IAttestationIndexer(indexerAddress));
    }

    /// @inheritdoc IDiscountStrategy
    function calculateDiscount(uint256 price, address buyer) external view returns (uint256) {
        Attestation memory attestation = _getAttestation(buyer, schemaUid);
        if (!_verifyAttestation(attestation)) {
            return 0;
        }
        return Math.mulDiv(price, bps, MAX_BPS);
    }

    /// @dev Sets the fee percentage for the fee calculation
    function setBps(uint256 _bps) external onlyShopDefaultAdmin {
        require(_bps <= MAX_BPS, "bps exceeds MAX_BPS");
        bps = _bps;
    }

    /// @dev Sets the schema uid for the EAS attestation
    function setSchemaUid(bytes32 _schemaUid) external onlyShopDefaultAdmin {
        require(_schemaUid != 0, "schemaUid must be set");
        schemaUid = _schemaUid;
    }

    /// @dev Sets the schema uid for the EAS attestation
    function setIndexer(address indexerAddress) external onlyShopDefaultAdmin {
        require(indexerAddress != address(0), "indexerAddress must be set");
        _setIndexer(IAttestationIndexer(indexerAddress));
    }

    /// @inheritdoc IDiscountStrategy
    function getType() external pure override returns (string memory) {
        return "EAS_ATTESTATION_DISCOUNT";
    }

    function _verifyAttestation(Attestation memory attestation) private view returns (bool) {
        if (attestation.uid == 0) {
            return false;
        }
        if (attestation.expirationTime != 0 && attestation.expirationTime <= block.timestamp) {
            return false;
        }
        if (attestation.revocationTime != 0) {
            return false;
        }
        if (attestation.attester == address(0)) {
            return false;
        }
        if (attestation.schema == 0) {
            return false;
        }
        return true;
    }
}
