"use client";
import {
  CopySimple,
  PencilLine,
  PlusCircle,
  Question,
} from "@phosphor-icons/react";
import { ReactNode, useEffect, useState } from "react";
import { getContract } from "viem";

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
  FeeShareStrategyType,
  feeShareStrategyTypeInfo,
} from "@/types/strategies";

import { ActionDialog, ActionDialogTab } from "./actions/action-dialog";
import { getUpdateAllowlistAction } from "./actions/update-allowlist-action";
import { getUpdatePercentageAction } from "./actions/update-percentage-action";
import { getUpdateTimeframeAction } from "./actions/update-timeframe-action";
import { CreateFeeShareStrategyForm } from "./create-fee-share-strategy-form";

export function FeeShareStrategies() {
  const { shopContract } = useSelectShop();
  const { publicClient, walletClient } = useContracts();
  const [feeShareStrategies, setFeeShareStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getFeeShareStrategies = async () => {
    setLoading(true);
    try {
      const feeShareStrategies =
        await shopContract.read.getFeeShareStrategies();
      console.log({ feeShareStrategies });
      const feeShareStrategiesWithActions = [];
      for (const feeShareStrategyAddress of feeShareStrategies) {
        // @ts-ignore
        const contract = getContract({
          address: feeShareStrategyAddress,
          abi: contracts.IRewardStrategy.abi,
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
          case FeeShareStrategyType.PERCENTAGE_FEE_SHARE: {
            // @ts-ignore
            const strategyContract = getContract({
              address: feeShareStrategyAddress,
              abi: contracts[FeeShareStrategyType.PERCENTAGE_FEE_SHARE].abi,
              client: {
                public: publicClient,
                wallet: walletClient,
              },
            });
            variables = {
              ["Fee Share Percentage"]: `${
                // @ts-ignore
                Number(await strategyContract.read.bps()) / 100
              }%`,
            };
            actions = [
              getUpdatePercentageAction({
                // @ts-ignore
                initialBps: await strategyContract.read.bps(),
                strategyContract,
                refresh: getFeeShareStrategies,
              }),
            ];
            break;
          }
          case FeeShareStrategyType.TIMEFRAME_PERCENTAGE_FEE_SHARE: {
            // @ts-ignore
            const strategyContract = getContract({
              address: feeShareStrategyAddress,
              abi: contracts[
                FeeShareStrategyType.TIMEFRAME_PERCENTAGE_FEE_SHARE
              ].abi,
              client: {
                public: publicClient,
                wallet: walletClient,
              },
            });
            variables = {
              ["Fee Share Percentage"]: `${
                // @ts-ignore
                Number(await strategyContract.read.bps()) / 100
              }%`,
              ["Start Time"]: new Date(
                // @ts-ignore
                Number(await strategyContract.read.startTimestamp()) * 1000,
              ).toLocaleString(undefined, {
                timeZoneName: "short",
              }),
              ["End Time"]: new Date(
                // @ts-ignore
                Number(await strategyContract.read.endTimestamp()) * 1000,
              ).toLocaleString(undefined, {
                timeZoneName: "short",
              }),
            };
            actions = [
              getUpdatePercentageAction({
                // @ts-ignore
                initialBps: await strategyContract.read.bps(),
                strategyContract,
                refresh: getFeeShareStrategies,
              }),
              getUpdateTimeframeAction({
                initialStartTimestamp:
                  // @ts-ignore
                  await strategyContract.read.startTimestamp(),
                // @ts-ignore
                initialEndTimestamp: await strategyContract.read.endTimestamp(),
                strategyContract,
                refresh: getFeeShareStrategies,
              }),
            ];
            break;
          }
          case FeeShareStrategyType.ALLOWLIST_PERCENTAGE_FEE_SHARE: {
            // @ts-ignore
            const strategyContract = getContract({
              address: feeShareStrategyAddress,
              abi: contracts[
                FeeShareStrategyType.ALLOWLIST_PERCENTAGE_FEE_SHARE
              ].abi,
              client: {
                public: publicClient,
                wallet: walletClient,
              },
            });
            variables = {
              ["Fee Share Percentage"]: `${
                // @ts-ignore
                Number(await strategyContract.read.bps()) / 100
              }%`,
              // @ts-ignore
              ["Allowlist Size"]: `${await strategyContract.read.getAllowlistLength()}`,
            };
            actions = [
              getUpdatePercentageAction({
                // @ts-ignore
                initialBps: await strategyContract.read.bps(),
                strategyContract,
                refresh: getFeeShareStrategies,
              }),
              getUpdateAllowlistAction({
                strategyContract,
                refresh: getFeeShareStrategies,
              }),
            ];
            break;
          }

          default:
            break;
        }

        feeShareStrategiesWithActions.push({
          type,
          contractAddress: feeShareStrategyAddress,
          variables,
          actions,
        });
      }
      setFeeShareStrategies(feeShareStrategiesWithActions);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error fetching fee share strategies",
        description:
          error.message ||
          "An error occurred while fetching fee share strategies.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!shopContract) return;
    getFeeShareStrategies();
  }, [shopContract]); // eslint-disable-line

  return (
    <Card x-chunk="dashboard-07-chunk-1">
      <CardHeader>
        <CardTitle>Fee Share Strategies</CardTitle>
        <CardDescription>
          Fee share strategies allow you to incentivize users to refer others to
          purchase products by providing rewards to referrers. You can customize
          fee share strategies to determine how much of the purchase price is
          shared with the referrer.
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
            {loading && (
              <TableRow className="hover:bg-background">
                <TableCell colSpan={4} className="pt-6 text-center">
                  Loading referral / fee share strategies...
                </TableCell>
              </TableRow>
            )}
            {!loading && !feeShareStrategies.length && (
              <TableRow className="hover:bg-background">
                <TableCell colSpan={4} className="pt-6 text-center">
                  No referral / fee share strategies found.
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              feeShareStrategies &&
              feeShareStrategies.map((strategy) => (
                <TableRow key={strategy.contractAddress}>
                  <TableCell className="font-semibold">
                    {
                      feeShareStrategyTypeInfo[
                        strategy.type as FeeShareStrategyType
                      ].name
                    }{" "}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Question className="inline cursor-pointer text-muted-foreground" />
                      </PopoverTrigger>
                      <PopoverContent className="w-80 text-xs">
                        {
                          feeShareStrategyTypeInfo[
                            strategy.type as FeeShareStrategyType
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
        <CreateFeeShareStrategyForm refresh={getFeeShareStrategies}>
          <Button size="sm" variant="ghost" className="gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            Create from template
          </Button>
        </CreateFeeShareStrategyForm>
      </CardFooter>
    </Card>
  );
}
