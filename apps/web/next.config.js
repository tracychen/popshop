/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  experimental: {
    appDir: true,
  },
  reactStrictMode: false,
  images: {
    domains: ["popshop.s3.amazonaws.com"],
  },
};
