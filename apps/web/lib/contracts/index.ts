import { anvil, base, baseSepolia } from "viem/chains";

import {
  DiscountStrategyType,
  FeeShareStrategyType,
  RewardStrategyType,
} from "@/types/strategies";

import { chain } from "../chain";
import {
  abi as AllowlistDiscountStrategyABI,
  bytecode as AllowlistDiscountStrategyBytecode,
} from "./abi/discount/allowlist-discount-strategy";
import { abi as IDiscountStrategyABI } from "./abi/discount/i-discount-strategy";
import {
  abi as MinERC20DiscountStrategyABI,
  bytecode as MinERC20DiscountStrategyBytecode,
} from "./abi/discount/min-erc20-discount-strategy";
import {
  abi as MinERC721DiscountStrategyABI,
  bytecode as MinERC721DiscountStrategyBytecode,
} from "./abi/discount/min-erc721-discount-strategy";
import {
  abi as AllowlistPercentageFeeShareStrategyABI,
  bytecode as AllowlistPercentageFeeShareStrategyBytecode,
} from "./abi/fee-share/allowlist-percentage-strategy";
import { abi as IFeeShareStrategyABI } from "./abi/fee-share/i-fee-share-strategy";
import {
  abi as PercentageFeeShareStrategyABI,
  bytecode as PercentageFeeShareStrategyBytecode,
} from "./abi/fee-share/percentage-strategy";
import {
  abi as TimeframePercentageFeeShareStrategyABI,
  bytecode as TimeframePercentageFeeShareStrategyBytecode,
} from "./abi/fee-share/timeframe-percentage-strategy";
import { abi as IERC20ABI } from "./abi/i-erc20";
import { abi as IERC721ABI } from "./abi/i-erc721";
import {
  abi as AllowlistFixedERC20RewardStrategyABI,
  bytecode as AllowlistFixedERC20RewardStrategyBytecode,
} from "./abi/reward/allowlist-fixed-erc20-strategy";
import {
  abi as BondingCurveERC20RewardStrategyABI,
  bytecode as BondingCurveERC20RewardStrategyBytecode,
} from "./abi/reward/bonding-curve-erc20-strategy";
import {
  abi as FixedERC20RewardStrategyABI,
  bytecode as FixedERC20RewardStrategyBytecode,
} from "./abi/reward/fixed-erc20-strategy";
import { abi as IRewardStrategyABI } from "./abi/reward/i-reward-strategy";
import {
  abi as LinearERC20RewardStrategyABI,
  bytecode as LinearERC20RewardStrategyBytecode,
} from "./abi/reward/linear-erc20-strategy";
import { abi as ShopABI } from "./abi/shop";
import { abi as ShopFactoryABI } from "./abi/shop-factory";
import { abi as ShopRegistryABI } from "./abi/shop-registry";

export const contracts: {
  [key: string]: {
    address?: string;
    abi: any;
    bytecode?: string;
  };
} = {
  ShopRegistry: {
    address: {
      [anvil.id]: "0x8598AF50056A86B439e8d1af9a86c345CaF350B1",
      [baseSepolia.id]: "0x1234567890123456789012345678901234567890", // TODO
      [base.id]: "0x1234567890123456789012345678901234567890", // TODO
    }[chain.id],
    abi: ShopRegistryABI,
  },
  ShopFactory: {
    address: {
      [anvil.id]: "0x7431FC644f90d1120A41077Aee75CDbbDEeABe26",
      [baseSepolia.id]: "0x1234567890123456789012345678901234567890", // TODO
      [base.id]: "0x1234567890123456789012345678901234567890", // TODO
    }[chain.id],
    abi: ShopFactoryABI,
  },
  USDC: {
    address: {
      [anvil.id]: "0x63fea6E447F120B8Faf85B53cdaD8348e645D80E",
      [baseSepolia.id]: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      [base.id]: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", // TODO
    }[chain.id],
    abi: IERC20ABI,
  },
  Shop: {
    abi: ShopABI,
  },
  IDiscountStrategy: {
    abi: IDiscountStrategyABI,
  },
  IRewardStrategy: {
    abi: IRewardStrategyABI,
  },
  IFeeShareStrategy: {
    abi: IFeeShareStrategyABI,
  },
  IERC20: {
    abi: IERC20ABI,
  },
  IERC721: {
    abi: IERC721ABI,
  },
  [RewardStrategyType.FIXED_ERC20_REWARD]: {
    abi: FixedERC20RewardStrategyABI,
    bytecode: FixedERC20RewardStrategyBytecode,
  },
  [RewardStrategyType.LINEAR_ERC20_REWARD]: {
    abi: LinearERC20RewardStrategyABI,
    bytecode: LinearERC20RewardStrategyBytecode,
  },
  [RewardStrategyType.BONDING_CURVE_ERC20_REWARD]: {
    abi: BondingCurveERC20RewardStrategyABI,
    bytecode: BondingCurveERC20RewardStrategyBytecode,
  },
  [RewardStrategyType.ALLOWLIST_FIXED_ERC20_REWARD]: {
    abi: AllowlistFixedERC20RewardStrategyABI,
    bytecode: AllowlistFixedERC20RewardStrategyBytecode,
  },
  [FeeShareStrategyType.PERCENTAGE_FEE_SHARE]: {
    abi: PercentageFeeShareStrategyABI,
    bytecode: PercentageFeeShareStrategyBytecode,
  },
  [FeeShareStrategyType.TIMEFRAME_PERCENTAGE_FEE_SHARE]: {
    abi: TimeframePercentageFeeShareStrategyABI,
    bytecode: TimeframePercentageFeeShareStrategyBytecode,
  },
  [FeeShareStrategyType.ALLOWLIST_PERCENTAGE_FEE_SHARE]: {
    abi: AllowlistPercentageFeeShareStrategyABI,
    bytecode: AllowlistPercentageFeeShareStrategyBytecode,
  },
  [DiscountStrategyType.ALLOWLIST_DISCOUNT]: {
    abi: AllowlistDiscountStrategyABI,
    bytecode: AllowlistDiscountStrategyBytecode,
  },
  [DiscountStrategyType.MIN_ERC20_DISCOUNT]: {
    abi: MinERC20DiscountStrategyABI,
    bytecode: MinERC20DiscountStrategyBytecode,
  },
  [DiscountStrategyType.MIN_ERC721_DISCOUNT]: {
    abi: MinERC721DiscountStrategyABI,
    bytecode: MinERC721DiscountStrategyBytecode,
  },
};
