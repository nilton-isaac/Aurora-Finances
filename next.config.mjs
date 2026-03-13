/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@tremor/react", "lucide-react"]
  }
};

export default nextConfig;

