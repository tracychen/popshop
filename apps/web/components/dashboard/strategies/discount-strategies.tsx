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
import {
  DiscountStrategyType,
  discountStrategyTypeInfo,
} from "@/types/strategies";

import { ActionDialog, ActionDialogTab } from "./actions/action-dialog";
import { getUpdateAllowlistBpsAction } from "./actions/update-allowlist-bps-action";
import { getUpdateEASSchemaAction } from "./actions/update-eas-schema-action";
import { getUpdateMinBalanceAction } from "./actions/update-min-balance-action";
import { getUpdateMinBalanceERC20Action } from "./actions/update-min-balance-erc20-action";
import { getUpdatePercentageAction } from "./actions/update-percentage-action";
import { getUpdateShopTokenAction } from "./actions/update-shop-token-action";
import { CreateDiscountStrategyForm } from "./create-discount-strategy-form";

export function DiscountStrategies() {
  const { shopContract } = useSelectShop();
  const { publicClient, walletClient } = useContracts();
  const [strategies, setStrategies] = useState<any[]>([]);

  const getDiscountStrategies = async () => {
    const discountStrategies = await shopContract.read.getDiscountStrategies();
    console.log({ discountStrategies });
    const formattedStrategies = [];
    for (const strategyAddress of discountStrategies) {
      // @ts-ignore
      const contract = getContract({
        address: strategyAddress,
        abi: contracts.IDiscountStrategy.abi,
        client: {
          public: publicClient,
        },
      });
      let variables = {};
      let actions: ActionDialogTab[] = [];
      // @ts-ignore
      const type = await contract.read.getType();

      // @ts-ignore
      switch (type) {
        case DiscountStrategyType.MIN_ERC20_DISCOUNT: {
          // @ts-ignore
          const strategyContract = getContract({
            address: strategyAddress,
            abi: contracts[DiscountStrategyType.MIN_ERC20_DISCOUNT].abi,
            client: {
              public: publicClient,
              wallet: walletClient,
            },
          });
          // @ts-ignore
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
          // @ts-ignore
          const symbol = await tokenContract.read.symbol();
          // @ts-ignore
          const decimals = await tokenContract.read.decimals();
          variables = {
            ["Token"]: symbol,
            ["Token Address"]: tokenAddress,
            ["Min. Balance For Discount"]: `${formatUnits(
              // @ts-ignore
              await strategyContract.read.minBalance(),
              decimals,
            )} ${symbol}`,

            ["Percentage Discount"]: `${
              // @ts-ignore
              Number(await strategyContract.read.bps()) / 100
            }%`,
          };
          actions = [
            getUpdatePercentageAction({
              // @ts-ignore
              initialBps: await strategyContract.read.bps(),
              strategyContract,
              refresh: getDiscountStrategies,
            }),
            getUpdateMinBalanceERC20Action({
              symbol,
              decimals,
              strategyContract,
              refresh: getDiscountStrategies,
            }),
          ];
          break;
        }
        case DiscountStrategyType.MIN_ERC721_DISCOUNT: {
          // @ts-ignore
          const strategyContract = getContract({
            address: strategyAddress,
            abi: contracts[DiscountStrategyType.MIN_ERC721_DISCOUNT].abi,
            client: {
              public: publicClient,
              wallet: walletClient,
            },
          });
          // @ts-ignore
          const tokenAddress = await strategyContract.read.shopToken();
          variables = {
            ["ERC721 Address"]: tokenAddress,
            // @ts-ignore
            ["Min. Balance For Discount"]: `${await strategyContract.read.minBalance()}`,
            ["Percentage Discount"]: `${
              // @ts-ignore
              Number(await strategyContract.read.bps()) / 100
            }%`,
          };
          actions = [
            getUpdatePercentageAction({
              // @ts-ignore
              initialBps: await strategyContract.read.bps(),
              strategyContract,
              refresh: getDiscountStrategies,
            }),
            getUpdateMinBalanceAction({
              strategyContract,
              refresh: getDiscountStrategies,
            }),
            getUpdateShopTokenAction({
              strategyContract,
              refresh: getDiscountStrategies,
            }),
          ];
          break;
        }
        case DiscountStrategyType.ALLOWLIST_DISCOUNT: {
          // @ts-ignore
          const strategyContract = getContract({
            address: strategyAddress,
            abi: contracts[DiscountStrategyType.ALLOWLIST_DISCOUNT].abi,
            client: {
              public: publicClient,
              wallet: walletClient,
            },
          });
          variables = {
            // @ts-ignore
            ["Allowlist Size"]: `${await strategyContract.read.getAllowlistLength()}`,
          };
          actions = [
            getUpdateAllowlistBpsAction({
              strategyContract,
              refresh: getDiscountStrategies,
            }),
          ];
          break;
        }
        case DiscountStrategyType.EAS_ATTESTATION_DISCOUNT: {
          // @ts-ignore
          const strategyContract = getContract({
            address: strategyAddress,
            abi: contracts[DiscountStrategyType.EAS_ATTESTATION_DISCOUNT].abi,
            client: {
              public: publicClient,
              wallet: walletClient,
            },
          });
          // @ts-ignore
          const initialIndexerAddress = await strategyContract.read.indexer();
          // @ts-ignore
          const initialSchemaUid = await strategyContract.read.schemaUid([]);
          // @ts-ignore
          const initialBps = await strategyContract.read.bps();
          variables = {
            ["Percentage Discount"]: `${Number(initialBps) / 100}%`,
            ["Schema ID"]: initialSchemaUid,
            ["Indexer Address"]: initialIndexerAddress,
          };
          actions = [
            getUpdatePercentageAction({
              initialBps,
              strategyContract,
              refresh: getDiscountStrategies,
            }),
            getUpdateEASSchemaAction({
              initialIndexerAddress,
              initialSchemaUid,
              strategyContract,
              refresh: getDiscountStrategies,
            }),
          ];
          break;
        }
        default:
          break;
      }

      formattedStrategies.push({
        type,
        contractAddress: strategyAddress,
        variables,
        actions,
      });
    }
    setStrategies(formattedStrategies);
  };

  useEffect(() => {
    if (!shopContract) return;
    getDiscountStrategies();
  }, [shopContract]); // eslint-disable-line

  return (
    <Card x-chunk="dashboard-07-chunk-1">
      <CardHeader>
        <CardTitle>Discount Strategies</CardTitle>
        <CardDescription>
          Discount strategies allow you to incentivize users to purchase
          products by offering discounts based on certain conditions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32 md:w-56">Type</TableHead>
              <TableHead>Contract Address</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {strategies &&
              strategies.map((strategy) => (
                <TableRow key={strategy.contractAddress}>
                  <TableCell className="font-semibold">
                    {
                      discountStrategyTypeInfo[
                        strategy.type as DiscountStrategyType
                      ].name
                    }{" "}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Question className="inline cursor-pointer text-muted-foreground" />
                      </PopoverTrigger>
                      <PopoverContent className="w-80 text-xs">
                        {
                          discountStrategyTypeInfo[
                            strategy.type as DiscountStrategyType
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
                            {truncateStringMiddle(strategy.contractAddress, 14)}
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
                  <TableCell>
                    <ScrollArea className="whitespace-nowrap rounded-md border sm:w-96">
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
        <CreateDiscountStrategyForm refresh={getDiscountStrategies}>
          <Button size="sm" variant="ghost" className="gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            Create from template
          </Button>
        </CreateDiscountStrategyForm>
      </CardFooter>
    </Card>
  );
}
