"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelectShop } from "@/providers/select-shop-provider";

export function ShopSelect() {
  const { shop, shops, setShop, loading } = useSelectShop();

  return (
    <>
      <Select
        onValueChange={(value) => {
          const shopInfo = shops.find((shop) => shop.shopAddress === value);
          if (shopInfo) {
            setShop(shopInfo);
          }
        }}
      >
        <SelectTrigger
          id="reward"
          aria-label="Select shop"
          className="w-full items-start overflow-hidden text-ellipsis text-xs md:w-[320px] md:text-sm lg:w-[360px]"
        >
          <SelectValue
            placeholder={
              !loading && shops?.length === 0 ? "No shops found" : "Select shop"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {loading && <SelectItem value="loading">Loading...</SelectItem>}
          {shops &&
            shops.map((shop) => (
              <SelectItem
                key={shop.shopAddress}
                value={shop.shopAddress}
                className="overflow-hidden text-ellipsis"
              >
                {shop.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </>
  );
}
