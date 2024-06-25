export enum RewardStrategyType {
  FIXED_ERC20_REWARD = "FIXED_ERC20_REWARD",
  LINEAR_ERC20_REWARD = "LINEAR_ERC20_REWARD",
  BONDING_CURVE_ERC20_REWARD = "BONDING_CURVE_ERC20_REWARD",
  ALLOWLIST_FIXED_ERC20_REWARD = "ALLOWLIST_FIXED_ERC20_REWARD",
}

export const rewardStrategyTypeInfo = {
  [RewardStrategyType.FIXED_ERC20_REWARD]: {
    name: "Fixed ERC20",
    description:
      "Fixed amount of tokens per purchase regardless of purchase price or number of units purchased.",
  },
  [RewardStrategyType.LINEAR_ERC20_REWARD]: {
    name: "Linear ERC20",
    description:
      "Linearly increasing amount of tokens per purchase based on total purchase price.",
  },
  [RewardStrategyType.BONDING_CURVE_ERC20_REWARD]: {
    name: "Bonding Curve ERC20",
    description:
      "Amount of tokens per purchase increases exponentially based on total purchase price and remaining supply.",
  },
  [RewardStrategyType.ALLOWLIST_FIXED_ERC20_REWARD]: {
    name: "Allowlist Fixed ERC20",
    description:
      "Fixed amount of tokens per purchase for a specific list of buyers. Allowlist can be added and modified after creating the strategy.",
  },
};

export enum FeeShareStrategyType {
  PERCENTAGE_FEE_SHARE = "PERCENTAGE_FEE_SHARE",
  TIMEFRAME_PERCENTAGE_FEE_SHARE = "TIMEFRAME_PERCENTAGE_FEE_SHARE",
  ALLOWLIST_PERCENTAGE_FEE_SHARE = "ALLOWLIST_PERCENTAGE_FEE_SHARE",
}

export const feeShareStrategyTypeInfo = {
  [FeeShareStrategyType.PERCENTAGE_FEE_SHARE]: {
    name: "Percentage",
    description:
      "Fixed percentage of the purchase price is shared with the referrer / recipient.",
  },
  [FeeShareStrategyType.TIMEFRAME_PERCENTAGE_FEE_SHARE]: {
    name: "Time Frame Percentage",
    description:
      "Fixed percentage of the purchase price is shared with the referrer / recipient and only applies during a specific timeframe.",
  },
  [FeeShareStrategyType.ALLOWLIST_PERCENTAGE_FEE_SHARE]: {
    name: "Allowlist Percentage",
    description:
      "Fixed percentage of the purchase price is shared with the referrer / recipient and requires an allowlist. Allowlist can be added and modified after creating the strategy.",
  },
};

export enum DiscountStrategyType {
  ALLOWLIST_DISCOUNT = "ALLOWLIST_DISCOUNT",
  MIN_ERC20_DISCOUNT = "MIN_ERC20_DISCOUNT",
  MIN_ERC721_DISCOUNT = "MIN_ERC721_DISCOUNT",
  TOKEN_ID_ALLOWLIST_ERC1155_DISCOUNT = "TOKEN_ID_ALLOWLIST_ERC1155_DISCOUNT",
  TIMEFRAME_DISCOUNT = "TIMEFRAME_DISCOUNT",
}

export const discountStrategyTypeInfo = {
  [DiscountStrategyType.ALLOWLIST_DISCOUNT]: {
    name: "Allowlist",
    description:
      "Discount for a specific list of buyers. Allowlist can be added and modified after creating the strategy and diffferent discounts can be set for each buyer.",
  },
  [DiscountStrategyType.MIN_ERC20_DISCOUNT]: {
    name: "Min. ERC20 Balance",
    description:
      "Discount for buyers that hold a minimum amount of an ERC20 token.",
  },
  [DiscountStrategyType.MIN_ERC721_DISCOUNT]: {
    name: "Min. ERC721 Balance",
    description:
      "Discount for buyers that hold a minimum amount of an ERC721 tokens",
  },
  [DiscountStrategyType.TOKEN_ID_ALLOWLIST_ERC1155_DISCOUNT]: {
    name: "Token ID Allowlist ERC1155",
    description:
      "Discount for buyers that hold a specific ERC1155 token ID. Eligible token IDs can be set after creating the strategy. Different discounts can be set for each token ID.",
  },
  [DiscountStrategyType.TIMEFRAME_DISCOUNT]: {
    name: "Time Frame",
    description:
      "Discount for buyers that purchase within a specific timeframe.",
  },
};
