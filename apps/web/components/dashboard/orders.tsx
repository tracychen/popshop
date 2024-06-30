"use client";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle,
  Funnel,
  FunnelSimple,
  XCircle,
} from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { coinbaseVerifiedAccountSchema } from "@/lib/eas";
import { useContracts } from "@/providers/contracts-provider";
import { useSelectShop } from "@/providers/select-shop-provider";
import { Product, Purchase } from "@/types";
import { Address, Avatar, Identity, Name } from "@coinbase/onchainkit/identity";
import { useCallback, useEffect, useState } from "react";
import { formatEther } from "viem";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const enum Sort {
  ProductIDAsc = "product_id_asc",
  ProductIDDesc = "product_id_desc",
  CountAsc = "count_asc",
  CountDesc = "count_desc",
  TotalPaidAsc = "total_paid_asc",
  TotalPaidDesc = "total_paid_desc",
  DateAsc = "date_asc",
  DateDesc = "date_desc",
  BuyerAsc = "buyer_asc",
  BuyerDesc = "buyer_desc",
  UnclaimedEarningsAsc = "unclaimed_earnings_asc",
  UnclaimedEarningsDesc = "unclaimed_earnings_desc",
}

const sortFunctions = {
  [Sort.ProductIDAsc]: (a: Purchase, b: Purchase) => a.productId - b.productId,
  [Sort.ProductIDDesc]: (a: Purchase, b: Purchase) => b.productId,
  [Sort.CountAsc]: (a: Purchase, b: Purchase) => a.count - b.count,
  [Sort.CountDesc]: (a: Purchase, b: Purchase) => b.count - a.count,
  [Sort.TotalPaidAsc]: (a: Purchase, b: Purchase) =>
    Number(BigInt(a.amountPaid) - BigInt(b.amountPaid)),
  [Sort.TotalPaidDesc]: (a: Purchase, b: Purchase) =>
    Number(BigInt(b.amountPaid) - BigInt(a.amountPaid)),
  [Sort.DateAsc]: (a: Purchase, b: Purchase) => a.purchaseTime - b.purchaseTime,
  [Sort.DateDesc]: (a: Purchase, b: Purchase) =>
    b.purchaseTime - a.purchaseTime,
  [Sort.BuyerAsc]: (a: Purchase, b: Purchase) => a.buyer.localeCompare(b.buyer),
  [Sort.BuyerDesc]: (a: Purchase, b: Purchase) =>
    b.buyer.localeCompare(a.buyer),
  [Sort.UnclaimedEarningsAsc]: (a: Purchase, b: Purchase) =>
    Number(BigInt(a.sellerAmount) - BigInt(b.sellerAmount)),
  [Sort.UnclaimedEarningsDesc]: (a: Purchase, b: Purchase) =>
    Number(BigInt(b.sellerAmount) - BigInt(a.sellerAmount)),
};

const enum Filter {
  All = "all",
  Completed = "completed",
  Refunded = "refunded",
  Pending = "pending",
}

export function OrdersDashboard() {
  const { shop, shopContract } = useSelectShop();
  const { publicClient } = useContracts();
  const [orders, setOrders] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<{ [key: number]: Product }>([]);
  const [sort, setSort] = useState<Sort>(Sort.ProductIDAsc);
  const [filter, setFilter] = useState<Filter>(Filter.All);

  const getProductMetadata = useCallback(
    async (product: { metadataURI: string }) => {
      const res = await fetch(
        `https://gateway.pinata.cloud/ipfs/${product.metadataURI}`,
      );
      const metadata = await res.json();
      return metadata;
    },
    [],
  );

  const getOrderStatus = (order: Purchase) => {
    if (order.refunded) {
      return Filter.Refunded;
    } else if (order.completed) {
      return Filter.Completed;
    } else {
      return Filter.Pending;
    }
  };

  const canClaimEarnings = (order: Purchase) => {
    const hasUnclaimedEarnings = BigInt(order.sellerAmount) !== BigInt(0);
    if (order.completed && hasUnclaimedEarnings) {
      return true;
    }
    const now = Math.floor(Date.now() / 1000);
    const pastChallengePeriod = now - order.purchaseTime > 60 * 60 * 24 * 7;
    if (pastChallengePeriod && hasUnclaimedEarnings) {
      return true;
    }
    return false;
  };

  const getOrders = async () => {
    try {
      const purchases = await shopContract.read.getPurchases();
      const formattedPurchases: Purchase[] = [];
      const productIds = new Set<number>();

      // Format purchases
      for (const purchase of purchases) {
        formattedPurchases.push({
          id: Number(purchase.id),
          productId: Number(purchase.productId),
          buyer: purchase.buyer,
          count: Number(purchase.count),
          amountPaid: String(purchase.amountPaid),
          sellerAmount: String(purchase.sellerAmount),
          purchaseTime: Number(purchase.purchaseTime),
          refundAmount: String(purchase.refundAmount),
          refunded: purchase.refunded,
          completed: purchase.completed,
        });
        productIds.add(purchase.productId);
      }

      // Get product metadata for each product
      const formattedProducts = await Promise.all(
        Array.from(productIds).map(async (productId: number) => {
          const [
            id,
            metadataURI,
            supply,
            price,
            discountStrategy,
            feeShareStrategy,
            rewardStrategy,
            paused,
            totalSold,
          ] = await shopContract.read.products([productId]);
          const metadata = await getProductMetadata({ metadataURI });
          return {
            id: Number(id),
            name: metadata.name,
            description: metadata.description,
            imageUrls: metadata.imageUrls,
            active: !paused,
            price: Number(formatEther(price)),
            totalSold: Number(totalSold),
            supply: Number(supply),
            discountStrategy,
            feeShareStrategy,
            rewardStrategy,
          };
        }),
      );

      // Convert to map of product id to product
      const productMap: { [key: number]: Product } = {};
      formattedProducts.forEach((product) => {
        productMap[product.id] = product;
      });

      setOrders(formattedPurchases);
      setProducts(productMap);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description:
          error.message ||
          "Error getting orders. Please contact us or try again later.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    orders.sort(sortFunctions[sort]);
    setOrders([...orders]);
  }, [sort]);

  useEffect(() => {
    if (filter === Filter.All) {
      if (shop && shopContract) {
        getOrders();
      }
    } else {
      getOrders();
      const filteredOrders = orders.filter(
        (order) => getOrderStatus(order) === filter,
      );
      setOrders(filteredOrders);
    }
  }, [shop, filter]);

  const claimEarnings = async (purchase: Purchase) => {
    try {
      toast({
        title: "Processing",
        description: `Claiming earnings for purchase ID ${purchase.id}`,
      });
      const hash = await shopContract.write.claimEarnings([purchase.id]);
      toast({
        title: "Processing",
        description: `Waiting for transaction receipt, hash: ${hash}`,
      });
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
      });
      if (receipt.status !== "success") {
        throw new Error("Transaction failed, hash: " + hash);
      }
      toast({
        title: "Success",
        description: `Claimed ${formatEther(
          BigInt(purchase.sellerAmount),
        )} ETH!`,
      });
      await getOrders();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error claiming earnings",
        description:
          error.message || "An error occurred while claiming earnings.",
        variant: "destructive",
      });
    }
  };

  if (!shop) {
    return (
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Card x-chunk="dashboard-07-chunk-0">
          <CardHeader>
            <CardTitle>View Orders</CardTitle>
            <CardDescription>
              You must select a shop to view orders.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3">
        <Tabs defaultValue="all">
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="all">All Orders</TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 gap-1">
                    <Funnel className="h-3.5 w-3.5" weight="fill" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Sort
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={sort === Sort.ProductIDAsc}
                    onClick={() => setSort(Sort.ProductIDAsc)}
                  >
                    Product ID <ArrowUp className="ml-2 h-3 w-3" />
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sort === Sort.ProductIDDesc}
                    onClick={() => setSort(Sort.ProductIDDesc)}
                  >
                    Product ID <ArrowDown className="ml-2 h-3 w-3" />
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sort === Sort.BuyerAsc}
                    onClick={() => setSort(Sort.BuyerAsc)}
                  >
                    Customer <ArrowUp className="ml-2 h-3 w-3" />
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sort === Sort.BuyerDesc}
                    onClick={() => setSort(Sort.BuyerDesc)}
                  >
                    Customer <ArrowDown className="ml-2 h-3 w-3" />
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sort === Sort.DateAsc}
                    onClick={() => setSort(Sort.DateAsc)}
                  >
                    Date <ArrowUp className="ml-2 h-3 w-3" />
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sort === Sort.DateDesc}
                    onClick={() => setSort(Sort.DateDesc)}
                  >
                    Date <ArrowDown className="ml-2 h-3 w-3" />
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sort === Sort.CountAsc}
                    onClick={() => setSort(Sort.CountAsc)}
                  >
                    Count <ArrowUp className="ml-2 h-3 w-3" />
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sort === Sort.CountDesc}
                    onClick={() => setSort(Sort.CountDesc)}
                  >
                    Count <ArrowDown className="ml-2 h-3 w-3" />
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sort === Sort.TotalPaidAsc}
                    onClick={() => setSort(Sort.TotalPaidAsc)}
                  >
                    Amount Paid <ArrowUp className="ml-2 h-3 w-3" />
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sort === Sort.TotalPaidDesc}
                    onClick={() => setSort(Sort.TotalPaidDesc)}
                  >
                    Amount Paid <ArrowDown className="ml-2 h-3 w-3" />
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sort === Sort.UnclaimedEarningsAsc}
                    onClick={() => setSort(Sort.UnclaimedEarningsAsc)}
                  >
                    Unclaimed Earnings <ArrowUp className="ml-2 h-3 w-3" />
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sort === Sort.UnclaimedEarningsDesc}
                    onClick={() => setSort(Sort.UnclaimedEarningsDesc)}
                  >
                    Unclaimed Earnings <ArrowDown className="ml-2 h-3 w-3" />
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 gap-1">
                    <FunnelSimple className="h-3.5 w-3.5" weight="fill" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Filter
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={filter === Filter.All}
                    onClick={() => setFilter(Filter.All)}
                  >
                    All
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filter === Filter.Pending}
                    onClick={() => setFilter(Filter.Pending)}
                  >
                    Pending
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filter === Filter.Completed}
                    onClick={() => setFilter(Filter.Completed)}
                  >
                    Completed
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filter === Filter.Refunded}
                    onClick={() => setFilter(Filter.Refunded)}
                  >
                    Refunded
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {/* <Button size="sm" variant="outline" className="h-7 gap-1 text-sm">
                <FileArrowDown className="h-3.5 w-3.5" weight="fill" />
                <span className="sr-only sm:not-sr-only">Export</span>
              </Button> */}
            </div>
          </div>
          <TabsContent value="all">
            <Card x-chunk="dashboard-05-chunk-3">
              <CardHeader className="px-7">
                <CardTitle>Orders</CardTitle>
                <CardDescription>
                  Recent orders from your store.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Status
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Date
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Product
                      </TableHead>
                      <TableHead className="hidden text-right sm:table-cell">
                        Count
                      </TableHead>
                      <TableHead className="hidden text-right sm:table-cell">
                        Amount Paid
                      </TableHead>
                      <TableHead className="text-right">
                        Unclaimed Earnings
                      </TableHead>
                      <TableHead className="hidden text-center sm:table-cell">
                        Can Claim
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders &&
                      orders.map((order, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Identity
                                    address={order.buyer as `0x${string}`}
                                    schemaId={coinbaseVerifiedAccountSchema}
                                  >
                                    <Avatar
                                      address={order.buyer as `0x${string}`}
                                    />
                                    <Name className="text-sm font-medium leading-none" />
                                    <Address className="text-xs leading-none text-muted-foreground" />
                                  </Identity>{" "}
                                </TooltipTrigger>
                                <TooltipContent>{order.buyer}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge className="text-xs" variant="secondary">
                              {getOrderStatus(order)}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {new Date(
                              order.purchaseTime * 1000,
                            ).toLocaleString()}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {products[order.productId].name}
                          </TableCell>
                          <TableCell className="hidden text-right sm:table-cell">
                            {order.count}
                          </TableCell>
                          <TableCell className="hidden text-right sm:table-cell">
                            {formatEther(BigInt(order.amountPaid))} ETH
                          </TableCell>
                          <TableCell className="text-right">
                            {formatEther(BigInt(order.sellerAmount))} ETH
                          </TableCell>
                          <TableCell className="hidden text-center sm:table-cell">
                            {canClaimEarnings(order) ? (
                              <CheckCircle
                                className="inline h-4 w-4 text-primary hover:cursor-pointer"
                                onClick={() => claimEarnings(order)}
                              />
                            ) : (
                              <XCircle className="inline h-4 w-4 text-destructive" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
