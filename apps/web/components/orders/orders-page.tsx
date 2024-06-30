"use client";
import { CheckCircle } from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { getShopMetadata } from "@/lib/metadata";
import { useContracts } from "@/providers/contracts-provider";
import { Product, Purchase } from "@/types";
import { useWallets } from "@privy-io/react-auth";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { formatEther, getContract } from "viem";

const enum Filter {
  All = "all",
  Completed = "completed",
  Refunded = "refunded",
  Pending = "pending",
}

export function OrdersPage() {
  const { wallets } = useWallets();
  const { shopRegistryContract, publicClient, walletClient } = useContracts();

  const [shopOrders, setShopOrders] = useState<{
    [shopAddress: string]: {
      orders: Purchase[];
      products: { [productId: number]: Product };
      shopMetadata: any;
      shopContract: any;
    };
  }>({});
  const [loading, setLoading] = useState<boolean>(true);

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

  const getOrders = async () => {
    setLoading(true);
    try {
      const shops = await shopRegistryContract.read.getShops([]);
      const buyerAddress = wallets[0].address;
      for (const shop of shops) {
        const shopMetadata = await getShopMetadata(shop);
        const shopContract = getContract({
          address: shop.shopAddress,
          abi: contracts.Shop.abi,
          client: {
            public: publicClient,
            wallet: walletClient,
          },
        });
        const formattedPurchases: Purchase[] = [];
        const productIds = new Set<number>();
        // @ts-ignore
        const userPurchaseCount = await shopContract.read.userPurchaseCount([
          buyerAddress,
        ]);
        for (let i = 0; i < userPurchaseCount; i++) {
          // @ts-ignore
          const purchaseIndex = await shopContract.read.userPurchaseIndexes([
            buyerAddress,
            i,
          ]);
          const [
            id,
            productId,
            buyer,
            count,
            amountPaid,
            sellerAmount,
            purchaseTime,
            refundAmount,
            refunded,
            completed,
            // @ts-ignore
          ] = await shopContract.read.purchases([purchaseIndex]);
          formattedPurchases.push({
            id: Number(id),
            productId: Number(productId),
            buyer,
            count: Number(count),
            amountPaid: String(amountPaid),
            sellerAmount: String(sellerAmount),
            purchaseTime: Number(purchaseTime),
            refundAmount: String(refundAmount),
            refunded,
            completed,
          });
          productIds.add(productId);
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
              // @ts-ignore
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

        shopOrders[shop.shopAddress] = {
          orders: formattedPurchases,
          products: productMap,
          shopMetadata,
          shopContract,
        };
      }
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
    setLoading(false);
  };

  const markAsComplete = async (shopContract: any, order: Purchase) => {
    try {
      toast({
        title: "Processing",
        description: `Marking order as complete`,
      });
      const hash = await shopContract.write.completePurchase([order.id]);
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
        title: "Order marked as complete",
        description: "The order has been marked as complete.",
      });
      getOrders();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description:
          error.message ||
          "Error marking order as complete. Please contact us or try again later.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (shopRegistryContract && wallets.length > 0) {
      getOrders();
    }
  }, [shopRegistryContract, wallets]);

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:p-6 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3">
        <Card x-chunk="dashboard-05-chunk-3">
          <CardHeader className="px-7">
            <CardTitle>Orders</CardTitle>
            <CardDescription>Recent orders from your store.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="hidden sm:table-cell">Shop</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">
                    Count
                  </TableHead>
                  <TableHead className="hidden text-right sm:table-cell">
                    Amount Paid
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Loading orders...
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  shopOrders &&
                  Object.keys(shopOrders).map((shopAddress: string) => {
                    const { orders, products, shopMetadata, shopContract } =
                      shopOrders[shopAddress];
                    return orders.map((order, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {new Date(order.purchaseTime * 1000).toLocaleString()}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Link
                                  href={`/shops/${shopAddress}`}
                                  target="_blank"
                                >
                                  {shopMetadata?.name}
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>{shopAddress}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/shops/${shopAddress}/products/${order.productId}`}
                            target="_blank"
                          >
                            {products[order.productId].name}
                          </Link>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge className="text-xs" variant="secondary">
                            {getOrderStatus(order)}
                          </Badge>{" "}
                          {getOrderStatus(order) === Filter.Pending && (
                            <Badge
                              className="gap-1 text-xs hover:cursor-pointer"
                              onClick={async () =>
                                markAsComplete(shopContract, order)
                              }
                            >
                              <CheckCircle />
                              Mark as Complete
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden text-right sm:table-cell">
                          {order.count}
                        </TableCell>
                        <TableCell className="hidden text-right sm:table-cell">
                          {formatEther(BigInt(order.amountPaid))} ETH
                        </TableCell>
                      </TableRow>
                    ));
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
