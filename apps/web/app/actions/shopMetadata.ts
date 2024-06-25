"use server";
import { pinata } from "@/lib/pinata";

/**
 * Store shop metadata on IPFS
 * @param name - Shop name
 * @param description - Shop description
 * @param imageUrl - Shop image URL (IPFS hash)
 * @returns IPFS hash
 */
export async function storeShopMetadata(
  name: string,
  description: string,
  imageUrl: string,
): Promise<string> {
  const response = await pinata.pinJSONToIPFS({
    name,
    description,
    imageUrl,
  });

  return response.IpfsHash;
}

/**
 * Store product metadata on IPFS
 * @param name - Product name
 * @param description - Product description
 * @param imageUrls - Array of image URLs (IPFS hashes)
 * @returns IPFS hash
 */
export async function storeProductMetadata(
  name: string,
  description: string,
  imageUrls: string[],
): Promise<string> {
  const response = await pinata.pinJSONToIPFS({
    name,
    description,
    imageUrls,
  });

  return response.IpfsHash;
}
