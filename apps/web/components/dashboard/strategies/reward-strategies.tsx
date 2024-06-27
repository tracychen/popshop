"use client";
import {
  CopySimple,
  PencilLine,
  PlusCircle,
  Question,
} from "@phosphor-icons/react";
import { ReactNode, useEffect, useState } from "react";
import { formatUnits, getContract } from "viem";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import { contracts } from "@/lib/contracts";
import { truncateStringMiddle } from "@/lib/utils";
import { useContracts } from "@/providers/contracts-provider";
import { useSelectShop } from "@/providers/select-shop-provider";
import { RewardStrategyType, rewardStrategyTypeInfo } from "@/types/strategies";

import { ActionDialog, ActionDialogTab } from "./actions/action-dialog";
import { getFundRewardBalanceAction } from "./actions/fund-reward-balance-action";
import { getUpdateAllowlistAction } from "./actions/update-allowlist-action";
import { getUpdateBondingCurveAction } from "./actions/update-bonding-curve-action";
import { getUpdateMultiplierAction } from "./actions/update-multiplier-action";
import { getUpdateNumTokensAction } from "./actions/update-num-tokens-action";
import { getWithdrawAction } from "./actions/withdraw-action";
import { CreateRewardStrategyForm } from "./create-reward-strategy-form";

export function RewardStrategies() {
  const { shopContract } = useSelectShop();
  const { publicClient, walletClient } = useContracts();
  const [rewardStrategies, setRewardStrategies] = useState<any[]>([]);

  const getRewardStrategies = async () => {
    const rewardStrategies = await shopContract.read.getRewardStrategies();
    console.log({ rewardStrategies });
    const rewardStrategiesWithActions = [];
    for (const rewardStrategyAddress of rewardStrategies) {
      // @ts-ignore
      const contract = getContract({
        address: rewardStrategyAddress,
        abi: contracts.IRewardStrategy.abi,
        client: {
          public: publicClient,
        },
      });
      let variables = {};
      let actions: ActionDialogTab[] = [];
      const type = await contract.read.getType();

      // @ts-ignore
      switch (type) {
        case RewardStrategyType.FIXED_ERC20_REWARD: {
          // @ts-ignore
          const strategyContract = getContract({
            address: rewardStrategyAddress,
            abi: contracts[RewardStrategyType.FIXED_ERC20_REWARD].abi,
            client: {
              public: publicClient,
              wallet: walletClient,
            },
          });
          const tokenAddress = await strategyContract.read.shopToken();
          // @ts-ignore
          const tokenContract = getContract({
            address: tokenAddress,
            abi: contracts.IERC20.abi,
            client: {
              public: publicClient,
              wallet: walletClient,
            },
          });
          const symbol = await tokenContract.read.symbol();
          const decimals = await tokenContract.read.decimals();
          variables = {
            ["Token"]: symbol,
            ["Token Address"]: tokenAddress,
            ["Reward Per Purchase"]: `${formatUnits(
              await strategyContract.read.numTokens(),
              decimals,
            )} ${symbol}`,
            ["Remaining Reward Supply"]: `${formatUnits(
              await tokenContract.read.balanceOf([rewardStrategyAddress]),
              decimals,
            )} ${symbol}`,
          };
          actions = [
            getUpdateNumTokensAction({
              symbol: symbol as string,
              decimals: decimals as number,
              strategyContract,
              refresh: getRewardStrategies,
            }),
            getFundRewardBalanceAction({
              symbol: symbol as string,
              decimals: decimals as number,
              tokenContract,
              strategyAddress: rewardStrategyAddress,
              refresh: getRewardStrategies,
            }),
            getWithdrawAction({
              symbol: symbol as string,
              decimals: decimals as number,
              tokenContract,
              strategyContract,
              strategyAddress: rewardStrategyAddress,
              refresh: getRewardStrategies,
            }),
          ];
          break;
        }
        case RewardStrategyType.LINEAR_ERC20_REWARD: {
          // @ts-ignore
          const strategyContract = getContract({
            address: rewardStrategyAddress,
            abi: contracts[RewardStrategyType.LINEAR_ERC20_REWARD].abi,
            client: {
              public: publicClient,
              wallet: walletClient,
            },
          });
          const tokenAddress = await strategyContract.read.shopToken();
          // @ts-ignore
          const tokenContract = getContract({
            address: tokenAddress,
            abi: contracts.IERC20.abi,
            client: {
              public: publicClient,
              wallet: walletClient,
            },
          });
          const symbol = await tokenContract.read.symbol();
          const decimals = await tokenContract.read.decimals();
          variables = {
            ["Token"]: symbol,
            ["Token Address"]: tokenAddress,
            ["Purchase Price Multiplier"]: `${await strategyContract.read.multiplier()}`,
            ["Remaining Reward Supply"]: `${formatUnits(
              await tokenContract.read.balanceOf([rewardStrategyAddress]),
              decimals,
            )} ${symbol}`,
          };
          actions = [
            getUpdateMultiplierAction({
              symbol: symbol as string,
              decimals: decimals as number,
              strategyContract,
              refresh: getRewardStrategies,
            }),
            getFundRewardBalanceAction({
              symbol: symbol as string,
              decimals: decimals as number,
              tokenContract,
              strategyAddress: rewardStrategyAddress,
              refresh: getRewardStrategies,
            }),
            getWithdrawAction({
              symbol: symbol as string,
              decimals: decimals as number,
              tokenContract,
              strategyContract,
              strategyAddress: rewardStrategyAddress,
              refresh: getRewardStrategies,
            }),
          ];
          break;
        }
        case RewardStrategyType.BONDING_CURVE_ERC20_REWARD: {
          // @ts-ignore
          const strategyContract = getContract({
            address: rewardStrategyAddress,
            abi: contracts[RewardStrategyType.BONDING_CURVE_ERC20_REWARD].abi,
            client: {
              public: publicClient,
              wallet: walletClient,
            },
          });
          const tokenAddress = await strategyContract.read.shopToken();
          // @ts-ignore
          const tokenContract = getContract({
            address: tokenAddress,
            abi: contracts.IERC20.abi,
            client: {
              public: publicClient,
              wallet: walletClient,
            },
          });
          const symbol = await tokenContract.read.symbol();
          const decimals = await tokenContract.read.decimals();
          variables = {
            ["Token"]: symbol,
            ["Token Address"]: tokenAddress,
            ["Decay Constant"]: `${await strategyContract.read.decayConstant()}`,
            ["Base Reward Multiplier"]: `${await strategyContract.read.baseReward()}`,
            ["Remaining Reward Supply"]: `${formatUnits(
              await tokenContract.read.balanceOf([rewardStrategyAddress]),
              decimals,
            )} ${symbol}`,
          };
          actions = [
            getUpdateBondingCurveAction({
              strategyContract,
              initialBaseReward: await strategyContract.read.baseReward(),
              initialDecayConstant: await strategyContract.read.decayConstant(),
              refresh: getRewardStrategies,
            }),
            getFundRewardBalanceAction({
              symbol: symbol as string,
              decimals: decimals as number,
              tokenContract,
              strategyAddress: rewardStrategyAddress,
              refresh: getRewardStrategies,
            }),
            getWithdrawAction({
              symbol: symbol as string,
              decimals: decimals as number,
              tokenContract,
              strategyContract,
              strategyAddress: rewardStrategyAddress,
              refresh: getRewardStrategies,
            }),
          ];
          break;
        }
        case RewardStrategyType.ALLOWLIST_FIXED_ERC20_REWARD: {
          // @ts-ignore
          const strategyContract = getContract({
            address: rewardStrategyAddress,
            abi: contracts[RewardStrategyType.ALLOWLIST_FIXED_ERC20_REWARD].abi,
            client: {
              public: publicClient,
              wallet: walletClient,
            },
          });
          const tokenAddress = await strategyContract.read.shopToken();
          // @ts-ignore
          const tokenContract = getContract({
            address: tokenAddress,
            abi: contracts.IERC20.abi,
            client: {
              public: publicClient,
              wallet: walletClient,
            },
          });
          const symbol = await tokenContract.read.symbol();
          const decimals = await tokenContract.read.decimals();
          variables = {
            ["Token"]: symbol,
            ["Token Address"]: tokenAddress,
            ["Reward Per Purchase"]: `${formatUnits(
              await strategyContract.read.numTokens(),
              decimals,
            )} ${symbol}`,
            ["Allowlist Size"]: `${await strategyContract.read.getAllowlistLength()}`,
            ["Remaining Reward Supply"]: `${formatUnits(
              await tokenContract.read.balanceOf([rewardStrategyAddress]),
              decimals,
            )} ${symbol}`,
          };
          actions = [
            getUpdateNumTokensAction({
              symbol: symbol as string,
              decimals: decimals as number,
              strategyContract,
              refresh: getRewardStrategies,
            }),
            getFundRewardBalanceAction({
              symbol: symbol as string,
              decimals: decimals as number,
              tokenContract,
              strategyAddress: rewardStrategyAddress,
              refresh: getRewardStrategies,
            }),
            getWithdrawAction({
              symbol: symbol as string,
              decimals: decimals as number,
              tokenContract,
              strategyContract,
              strategyAddress: rewardStrategyAddress,
              refresh: getRewardStrategies,
            }),
            getUpdateAllowlistAction({
              strategyContract,
              refresh: getRewardStrategies,
            }),
          ];
          break;
        }
        default:
          break;
      }

      rewardStrategiesWithActions.push({
        type,
        contractAddress: rewardStrategyAddress,
        variables,
        actions,
      });
    }
    setRewardStrategies(rewardStrategiesWithActions);
  };

  useEffect(() => {
    if (!shopContract) return;
    getRewardStrategies();
  }, [shopContract]); // eslint-disable-line

  return (
    <Card x-chunk="dashboard-07-chunk-1">
      <CardHeader>
        <CardTitle>Reward Strategies</CardTitle>
        <CardDescription>
          Reward strategies allow you to incentivize users to purchase products
          by providing rewards. This could be memecoins, NFTs, or other custom
          rewards and issuance strategies.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32 md:w-56">Type</TableHead>
              <TableHead>Contract Address</TableHead>
              <TableHead className="hidden md:table-cell">Details</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rewardStrategies &&
              rewardStrategies.map((strategy) => (
                <TableRow key={strategy.contractAddress}>
                  <TableCell className="font-semibold">
                    {
                      rewardStrategyTypeInfo[
                        strategy.type as RewardStrategyType
                      ].name
                    }{" "}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Question className="inline cursor-pointer text-muted-foreground" />
                      </PopoverTrigger>
                      <PopoverContent className="w-80 text-xs">
                        {
                          rewardStrategyTypeInfo[
                            strategy.type as RewardStrategyType
                          ].description
                        }
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="hidden sm:table-cell">
                              {truncateStringMiddle(
                                strategy.contractAddress,
                                14,
                              )}
                            </div>
                            <div className="table-cell sm:hidden">
                              {truncateStringMiddle(
                                strategy.contractAddress,
                                6,
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {strategy.contractAddress}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <CopySimple
                        onClick={async () => {
                          await navigator.clipboard.writeText(
                            strategy.contractAddress,
                          );
                          toast({
                            title: "Copied",
                            description: "Contract address copied to clipboard",
                          });
                        }}
                        className="cursor-pointer text-muted-foreground"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                      <div className="flex w-max flex-col p-4 text-xs">
                        {Object.entries(strategy.variables).map(
                          ([key, value]) => (
                            <div key={key} className="flex gap-x-2">
                              <div className="text-muted-foreground">
                                {key}:
                              </div>
                              <div>{value as ReactNode}</div>
                            </div>
                          ),
                        )}
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </TableCell>
                  <TableCell className="text-center">
                    <ActionDialog tabs={strategy.actions}>
                      <Button size="sm" variant="ghost">
                        <PencilLine className="h-4 w-4" />
                      </Button>
                    </ActionDialog>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="justify-center border-t p-4">
        <CreateRewardStrategyForm refresh={getRewardStrategies}>
          <Button size="sm" variant="ghost" className="gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            Create from template
          </Button>
        </CreateRewardStrategyForm>
      </CardFooter>
    </Card>
  );
}
