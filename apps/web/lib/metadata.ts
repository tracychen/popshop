export const getShopMetadata = async (shop: {
  shopMetadataURI: string;
  shopAddress: string;
}) => {
  const res = await fetch(
    `https://gateway.pinata.cloud/ipfs/${shop.shopMetadataURI}`,
  );
  const metadata = await res.json();
  return {
    ...metadata,
    shopAddress: shop.shopAddress,
  };
};

export const getProductMetadata = async (product: { metadataURI: string }) => {
  const res = await fetch(
    `https://gateway.pinata.cloud/ipfs/${product.metadataURI}`,
  );
  const metadata = await res.json();
  return metadata;
};
