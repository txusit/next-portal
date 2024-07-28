/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['page.tsx', 'ts', 'page.jsx', 'js'],
  eslint: {
    dirs: ['.'],
  },
}

module.exports = nextConfig
