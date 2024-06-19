/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  experimental: {
    appDir: true,
  },
  reactStrictMode: false,
  images: {
    domains: ["starter.s3.amazonaws.com"],
  },
};
