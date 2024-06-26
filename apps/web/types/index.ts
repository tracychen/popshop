export type Product = {
  id: number;
  name: string;
  description: string;
  imageUrls: string[];
  active: boolean;
  price: number;
  totalSold: number;
  supply: number;
  discountStrategy: string;
  feeShareStrategy: string;
  rewardStrategy: string;
};

export type Shop = {
  shopAddress: string;
  name: string;
  description: string;
  image: string;
};