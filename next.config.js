/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['page.tsx', 'ts', 'page.jsx', 'js'],
  eslint: {
    dirs: ['.'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true, // This makes it a 308 permanent redirect. Set it to false for a 307 temporary redirect.
      },
    ]
  },
}

module.exports = nextConfig
