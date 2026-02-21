/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production';

const nextConfig = {
  transpilePackages: ['@pizza/shared'],
  // Keep dev artifacts separate from production build artifacts to avoid
  // stale chunk resolution errors during local development.
  distDir: isDev ? '.next-dev' : '.next',
};

module.exports = nextConfig;
