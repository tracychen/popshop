import { ArrowSquareOut, DotsThreeOutline } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { TabsContent } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { useContracts } from "@/providers/contracts-provider";
import { useSelectShop } from "@/providers/select-shop-provider";
import { Product } from "@/types";
import { useRouter } from "next/navigation";

export function ProductsTab({
  value,
  loading,
  products,
  refresh,
}: {
  value: string;
  loading: boolean;
  products: Product[];
  refresh: () => Promise<void>;
}) {
  const { shop, shopContract } = useSelectShop();
  const { publicClient } = useContracts();
  const router = useRouter();

  const deactivateProduct = async (product: Product) => {
    try {
      toast({
        title: "Processing",
        description: `Deactivating "${product.name}"`,
      });
      const hash = await shopContract.write.pauseProduct([product.id]);
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
        description: `Deactivated "${product.name}"`,
      });
      await refresh();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error deactivating product",
        description:
          error.message || "An error occurred while deactivating the product.",
        variant: "destructive",
      });
    }
  };

  const activateProduct = async (product: Product) => {
    try {
      toast({
        title: "Processing",
        description: `Activating "${product.name}"`,
      });
      const hash = await shopContract.write.unpauseProduct([product.id]);
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
        description: `Activated "${product.name}"`,
      });
      await refresh();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error activating product",
        description:
          error.message || "An error occurred while activating the product.",
        variant: "destructive",
      });
    }
  };

  return (
    <TabsContent value={value}>
      <Card x-chunk="dashboard-06-chunk-0">
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Manage your products and view their sales performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="hidden md:table-cell">
                  Total Sales
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Remaining Supply
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && products.length == 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Loading products...
                  </TableCell>
                </TableRow>
              )}
              {products.map((product, index) => (
                <TableRow key={index}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt="Product image"
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={
                        product.imageUrls.length > 0
                          ? `https://emerald-skilled-cat-398.mypinata.cloud/ipfs/${product.imageUrls[0]}`
                          : "/images/placeholder.svg"
                      }
                      width="64"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {product.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.price} Ξ</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {product.totalSold}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {product.supply}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <DotsThreeOutline className="h-4 w-4" weight="fill" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Link
                            href={`/shops/${shop.shopAddress}/products/${product.id}`}
                            className="flex w-full items-center justify-between"
                            target="_blank"
                          >
                            View
                            <ArrowSquareOut className="h-4 w-4" weight="fill" />
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            router.push(`/dashboard/products/${product.id}`);
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                        {product.active ? (
                          <DropdownMenuItem
                            onClick={async () =>
                              await deactivateProduct(product)
                            }
                          >
                            Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={async () => await activateProduct(product)}
                          >
                            Activate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            {/* TODO pagination */}
            Showing <strong>1-{products.length}</strong> of{" "}
            <strong>{products.length}</strong> products
          </div>
        </CardFooter>
      </Card>
    </TabsContent>
  );
}
