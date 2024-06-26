"use client";
import {
  ArrowDown,
  ArrowUp,
  FileArrowDown,
  Funnel,
  PlusCircle,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatEther } from "viem";

import { Button } from "@/components/ui/button";
import {
  Card,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSelectShop } from "@/providers/select-shop-provider";
import { Product } from "@/types";

import { toast } from "../ui/use-toast";
import { ProductsTab } from "./products-tab";

const enum Sort {
  IDAsc = "id_asc",
  NameAsc = "name_asc",
  PriceAsc = "price_asc",
  PriceDesc = "price_desc",
  TotalSalesAsc = "total_sales_asc",
  TotalSalesDesc = "total_sales_desc",
  RemainingSupplyAsc = "remaining_supply_asc",
  RemainingSupplyDesc = "remaining_supply_desc",
}

const sortFunctions = {
  [Sort.IDAsc]: (a: Product, b: Product) => a.id - b.id,
  [Sort.NameAsc]: (a: Product, b: Product) => a.name.localeCompare(b.name),
  [Sort.PriceAsc]: (a: Product, b: Product) =>
    Number(a.price) - Number(b.price),
  [Sort.PriceDesc]: (a: Product, b: Product) =>
    Number(b.price) - Number(a.price),
  [Sort.TotalSalesAsc]: (a: Product, b: Product) => a.totalSold - b.totalSold,
  [Sort.TotalSalesDesc]: (a: Product, b: Product) => b.totalSold - a.totalSold,
  [Sort.RemainingSupplyAsc]: (a: Product, b: Product) => a.supply - b.supply,
  [Sort.RemainingSupplyDesc]: (a: Product, b: Product) => b.supply - a.supply,
};

export function ProductsDashboard() {
  const router = useRouter();
  const { shop, shopContract } = useSelectShop();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<Sort>(Sort.IDAsc);

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

  const getProducts = async () => {
    setLoading(true);
    try {
      const products = await shopContract.read.getProducts();

      console.log(products);
      const formattedProducts = await Promise.all(
        products.map(async (product: any) => {
          const metadata = await getProductMetadata(product);
          return {
            id: product.id,
            name: metadata.name,
            description: metadata.description,
            imageUrls: metadata.imageUrls,
            active: !product.paused,
            price: formatEther(product.price),
            totalSold: Number(product.totalSold),
            supply: Number(product.supply),
          };
        }),
      );
      if (sort !== Sort.IDAsc) {
        formattedProducts.sort(sortFunctions[sort]);
      }
      setProducts(formattedProducts);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error fetching products",
        description:
          error.message || "An error occurred while fetching products.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    products.sort(sortFunctions[sort]);
    setProducts([...products]);
  }, [sort]);

  useEffect(() => {
    if (shop) {
      getProducts();
    }
  }, [shop, shopContract, getProductMetadata]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!shop) {
    return (
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Card x-chunk="dashboard-07-chunk-0">
          <CardHeader>
            <CardTitle>View Products</CardTitle>
            <CardDescription>
              You must select a shop to view products.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
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
                  checked={sort === Sort.IDAsc}
                  onClick={() => setSort(Sort.IDAsc)}
                >
                  ID <ArrowUp className="ml-2 h-3 w-3" />
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sort === Sort.NameAsc}
                  onClick={() => setSort(Sort.NameAsc)}
                >
                  Name <ArrowUp className="ml-2 h-3 w-3" />
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sort === Sort.PriceAsc}
                  onClick={() => setSort(Sort.PriceAsc)}
                >
                  Price <ArrowUp className="ml-2 h-3 w-3" />
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sort === Sort.PriceDesc}
                  onClick={() => setSort(Sort.PriceDesc)}
                >
                  Price <ArrowDown className="ml-2 h-3 w-3" />
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sort === Sort.TotalSalesAsc}
                  onClick={() => setSort(Sort.TotalSalesAsc)}
                >
                  Total Sales <ArrowUp className="ml-2 h-3 w-3" />
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sort === Sort.TotalSalesDesc}
                  onClick={() => setSort(Sort.TotalSalesDesc)}
                >
                  Total Sales <ArrowDown className="ml-2 h-3 w-3" />
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sort === Sort.RemainingSupplyAsc}
                  onClick={() => setSort(Sort.RemainingSupplyAsc)}
                >
                  Remaining Supply <ArrowUp className="ml-2 h-3 w-3" />
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sort === Sort.RemainingSupplyDesc}
                  onClick={() => setSort(Sort.RemainingSupplyDesc)}
                >
                  Remaining Supply <ArrowDown className="ml-2 h-3 w-3" />
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="h-7 gap-1">
              <FileArrowDown className="h-3.5 w-3.5" weight="fill" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button>
            <Button
              size="sm"
              className="h-7 gap-1"
              onClick={() => router.push("/dashboard/create")}
            >
              <PlusCircle className="h-3.5 w-3.5" weight="fill" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Product
              </span>
            </Button>
          </div>
        </div>
        <ProductsTab
          value="all"
          loading={loading}
          products={products}
          refresh={getProducts}
        />
        <ProductsTab
          value="active"
          loading={loading}
          products={products.filter((product) => product.active)}
          refresh={getProducts}
        />
        <ProductsTab
          value="inactive"
          loading={loading}
          products={products.filter((product) => !product.active)}
          refresh={getProducts}
        />
      </Tabs>
    </main>
  );
}
