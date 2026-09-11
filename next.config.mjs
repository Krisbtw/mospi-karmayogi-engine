/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "25mb" },
    serverComponentsExternalPackages: ["pdf-parse"],
  },
};

export default nextConfig;

