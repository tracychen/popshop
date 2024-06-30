// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {AccessControlEnumerable} from "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IDiscountStrategy} from "./discount/IDiscountStrategy.sol";
import {IFeeShareStrategy} from "./referral/IFeeShareStrategy.sol";
import {IRewardStrategy} from "./reward/IRewardStrategy.sol";
import {ShopRegistry} from "./ShopRegistry.sol";

contract Shop is Ownable, AccessControlEnumerable {
    string public shopMetadataURI;
    address public platformAddress;
    uint256 public platformFee; // in basis points (100 basis points = 1%)
    address public payoutAddress;
    IERC20 public shopToken;
    ShopRegistry public registry;

    uint256 public challengePeriod = 7 days; // Example challenge period

    struct Product {
        uint256 id;
        string metadataURI;
        uint256 supply;
        uint256 price;
        address discountStrategy;
        address feeShareStrategy;
        address rewardStrategy;
        bool paused;
        uint256 totalSold;
    }

    struct Purchase {
        uint256 id;
        uint256 productId;
        address buyer;
        uint256 count;
        uint256 amountPaid;
        uint256 sellerAmount;
        uint256 purchaseTime;
        uint256 refundAmount;
        bool refunded;
        bool completed;
    }

    /// @dev Track all products in the shop
    Product[] public products;

    /// @dev Track all purchases in the shop
    Purchase[] public purchases;

    /// @dev Track purchases per buyer
    mapping(address => uint256[]) public userPurchaseIndexes;
    mapping(address => uint256) public userPurchaseCount;

    /// @dev Track purchases per product
    mapping(uint256 => uint256[]) public productPurchaseIndexes;
    mapping(uint256 => uint256) public productPurchaseCount;

    // track shop strategies
    IRewardStrategy[] public rewardStrategies;
    IDiscountStrategy[] public discountStrategies;
    IFeeShareStrategy[] public feeShareStrategies;

    event ProductAdded(uint256 indexed productId, string metadataURI, uint256 supply, uint256 price);
    event ProductPurchased(
        uint256 indexed productId, address indexed buyer, uint256 indexed purchaseIndex, uint256 amount
    );
    event ProductReviewed(
        uint256 indexed productId, address indexed buyer, uint256 indexed purchaseIndex, uint8 rating, string review
    );
    event PurchaseCompleted(uint256 indexed productId, address indexed buyer, uint256 indexed purchaseIndex);
    event EarningsClaimed(
        uint256 indexed productId, address indexed seller, uint256 indexed purchaseIndex, uint256 amount
    );
    event ProductRefunded(
        uint256 indexed productId, address indexed buyer, uint256 indexed purchaseIndex, uint256 amount
    );
    event RewardApplied(
        address indexed rewardStrategy,
        uint256 indexed productId,
        address indexed buyer,
        uint256 purchaseIndex,
        uint256 amount
    );
    event DiscountApplied(
        address indexed discountStrategy,
        uint256 indexed productId,
        address indexed buyer,
        uint256 purchaseIndex,
        uint256 amount
    );
    event FeeShareApplied(
        address indexed feeShareStrategy,
        uint256 indexed productId,
        address indexed buyer,
        uint256 purchaseIndex,
        uint256 amount
    );
    event RewardStrategyRegistered(address indexed rewardStrategy);
    event DiscountStrategyRegistered(address indexed discountStrategy);
    event FeeShareStrategyRegistered(address indexed feeShareStrategy);

    constructor(
        string memory _shopMetadataURI,
        address _registry,
        address _platformAddress,
        uint256 _platformFee,
        address _initialAdmin
    ) Ownable(msg.sender) {
        shopMetadataURI = _shopMetadataURI;
        registry = ShopRegistry(_registry);
        address _owner = registry.owner();
        transferOwnership(_owner);
        platformAddress = _platformAddress;
        platformFee = _platformFee;
        payoutAddress = _initialAdmin;
        _grantRole(DEFAULT_ADMIN_ROLE, _initialAdmin);
        _grantRole(DEFAULT_ADMIN_ROLE, _owner);
    }

    function setShopMetadataURI(string memory _shopMetadataURI) public onlyRole(DEFAULT_ADMIN_ROLE) {
        shopMetadataURI = _shopMetadataURI;
    }

    function setPayoutAddress(address _payoutAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        payoutAddress = _payoutAddress;
    }

    function addAdmin(address newAdmin) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(DEFAULT_ADMIN_ROLE, newAdmin);
        registry.addShopAdmin(address(this), newAdmin);
    }

    function removeAdmin(address admin) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(admin != owner(), "Cannot remove owner");

        revokeRole(DEFAULT_ADMIN_ROLE, admin);
        registry.removeShopAdmin(address(this), admin);
    }

    function setPlatformFee(uint256 _platformFee) public onlyOwner {
        platformFee = _platformFee;
    }

    function setChallengePeriod(uint256 _challengePeriod) public onlyOwner {
        challengePeriod = _challengePeriod;
    }

    function addProduct(
        string memory metadataURI,
        uint256 supply,
        uint256 price,
        address discountStrategy,
        address feeShareStrategy,
        address rewardStrategy,
        bool paused
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 productId = products.length;
        products.push(
            Product({
                id: productId,
                metadataURI: metadataURI,
                supply: supply,
                price: price,
                discountStrategy: discountStrategy,
                feeShareStrategy: feeShareStrategy,
                rewardStrategy: rewardStrategy,
                paused: paused,
                totalSold: 0
            })
        );

        emit ProductAdded(productId, metadataURI, supply, price);
    }

    function updateProduct(
        uint256 index,
        string memory metadataURI,
        uint256 supply,
        uint256 price,
        address discountStrategy,
        address feeShareStrategy,
        address rewardStrategy
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(index < products.length, "Invalid product index");
        products[index].metadataURI = metadataURI;
        products[index].supply = supply;
        products[index].price = price;
        products[index].discountStrategy = discountStrategy;
        products[index].feeShareStrategy = feeShareStrategy;
        products[index].rewardStrategy = rewardStrategy;
    }

    function removeProduct(uint256 index) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(index < products.length, "Invalid product index");
        for (uint256 i = index; i < products.length - 1; i++) {
            products[i] = products[i + 1];
        }
        products.pop();
    }

    function pauseProduct(uint256 index) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(index < products.length, "Invalid product index");
        products[index].paused = true;
    }

    function unpauseProduct(uint256 index) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(index < products.length, "Invalid product index");
        products[index].paused = false;
    }

    function purchaseProduct(uint256 index, uint256 count, address feeShareAddress) public payable {
        require(index < products.length, "Invalid product index");
        require(!products[index].paused, "Product is paused");
        require(products[index].supply >= count, "Insufficient supply");
        require(count > 0, "Invalid count");

        uint256 price = products[index].price * count;
        uint256 purchaseIndex = purchases.length;

        // Apply discount
        if (products[index].discountStrategy != address(0)) {
            IDiscountStrategy discountStrategy = IDiscountStrategy(products[index].discountStrategy);
            uint256 discount = discountStrategy.calculateDiscount(price, msg.sender);
            price = price - discount;
            emit DiscountApplied(products[index].discountStrategy, index, msg.sender, purchaseIndex, discount);
        }
        require(msg.value >= price, "Insufficient funds");

        products[index].supply -= count;

        // Calculate and distribute platform fee
        uint256 feeAmount = (price * platformFee) / 10000;
        payable(platformAddress).transfer(feeAmount);

        uint256 sellerAmount = price - feeAmount;

        // Distribute fee share
        if (products[index].feeShareStrategy != address(0)) {
            IFeeShareStrategy feeShareStrategy = IFeeShareStrategy(products[index].feeShareStrategy);
            uint256 fee = feeShareStrategy.calculateFee(price, feeShareAddress);
            if (feeShareAddress != address(0) && fee > 0) {
                payable(feeShareAddress).transfer(fee);
                sellerAmount -= fee;
                emit FeeShareApplied(products[index].feeShareStrategy, index, feeShareAddress, purchaseIndex, fee);
            }
        }

        // Record purchase
        purchases.push(
            Purchase({
                id: purchaseIndex,
                productId: index,
                buyer: msg.sender,
                count: count,
                amountPaid: msg.value,
                sellerAmount: sellerAmount,
                purchaseTime: block.timestamp,
                refunded: false,
                refundAmount: 0,
                completed: false
            })
        );

        userPurchaseIndexes[msg.sender].push(purchaseIndex);
        userPurchaseCount[msg.sender]++;
        productPurchaseIndexes[index].push(purchaseIndex);
        productPurchaseCount[index]++;
        products[index].totalSold += count;

        // Provide buyer rewards
        if (products[index].rewardStrategy != address(0)) {
            IRewardStrategy rewardStrategy = IRewardStrategy(products[index].rewardStrategy);
            uint256 amount = rewardStrategy.calculateReward(price, products[index].supply, msg.sender);
            if (amount > 0) {
                rewardStrategy.reward(msg.sender, amount);
                emit RewardApplied(products[index].rewardStrategy, index, msg.sender, purchaseIndex, amount);
            }
        }

        emit ProductPurchased(index, msg.sender, purchaseIndex, price);
    }

    function completePurchase(uint256 purchaseIndex) public {
        require(purchaseIndex < purchases.length, "Invalid purchase index");
        Purchase storage purchase = purchases[purchaseIndex];
        require(purchase.buyer == msg.sender, "Unauthorized");
        require(purchase.amountPaid > 0, "No purchase found");
        require(!purchase.completed, "Purchase already completed");

        purchase.completed = true;

        emit PurchaseCompleted(purchase.productId, msg.sender, purchaseIndex);
    }

    function refundPurchase(uint256 purchaseIndex, uint256 refundAmount) public payable onlyRole(DEFAULT_ADMIN_ROLE) {
        Purchase storage purchase = purchases[purchaseIndex];
        require(purchase.amountPaid > 0, "No purchase found");
        require(!purchase.refunded, "Already refunded");
        require(
            refundAmount <= purchase.sellerAmount - purchase.refundAmount,
            "Refund amount exceeds seller earnings amount"
        );
        require(msg.value == refundAmount, "Incorrect refund amount");

        purchase.refundAmount += refundAmount;
        purchase.sellerAmount -= refundAmount;
        if (purchase.refundAmount == purchase.amountPaid) {
            purchase.refunded = true;
        }

        payable(purchase.buyer).transfer(refundAmount);
        emit ProductRefunded(purchase.productId, purchase.buyer, purchaseIndex, refundAmount);
    }

    function claimEarnings(uint256 purchaseIndex) public onlyRole(DEFAULT_ADMIN_ROLE) {
        Purchase storage purchase = purchases[purchaseIndex];
        require(purchase.amountPaid > 0, "No purchase found"); // TODO do we need to handle products that are $0?
        require(purchase.sellerAmount > 0, "No earnings to claim");
        require(!purchase.refunded, "Purchase refunded");
        require(
            purchase.completed || block.timestamp >= purchase.purchaseTime + challengePeriod,
            "Cannot claim earnings yet"
        );

        uint256 amountToClaim = purchase.sellerAmount - purchase.refundAmount;
        purchase.sellerAmount = 0;

        payable(payoutAddress).transfer(amountToClaim);

        emit EarningsClaimed(purchase.productId, payoutAddress, purchaseIndex, amountToClaim);
    }

    function getProducts() public view returns (Product[] memory) {
        return products;
    }

    function getPurchases() public view returns (Purchase[] memory) {
        return purchases;
    }

    function getRewardStrategies() public view returns (IRewardStrategy[] memory) {
        return rewardStrategies;
    }

    function getDiscountStrategies() public view returns (IDiscountStrategy[] memory) {
        return discountStrategies;
    }

    function getFeeShareStrategies() public view returns (IFeeShareStrategy[] memory) {
        return feeShareStrategies;
    }

    // Register reward strategy contract prevent duplicate registration
    function registerRewardStrategy(address strategyAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        IRewardStrategy rewardStrategy = IRewardStrategy(strategyAddress);
        rewardStrategies.push(rewardStrategy);
        emit RewardStrategyRegistered(strategyAddress);
    }

    // Register discount strategy contract TODO prevent duplicate registration
    function registerDiscountStrategy(address strategyAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        IDiscountStrategy discountStrategy = IDiscountStrategy(strategyAddress);
        discountStrategies.push(discountStrategy);
        emit DiscountStrategyRegistered(strategyAddress);
    }

    // Register fee share strategy contract prevent duplicate registration
    function registerFeeShareStrategy(address strategyAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        IFeeShareStrategy feeShareStrategy = IFeeShareStrategy(strategyAddress);
        feeShareStrategies.push(feeShareStrategy);
        emit FeeShareStrategyRegistered(strategyAddress);
    }
}
