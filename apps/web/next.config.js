/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  reactStrictMode: false,
  images: {
    domains: ["ipfs.io", process.env.NEXT_PUBLIC_GATEWAY_URL],
  },
};
