/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "15mb" }, // headroom for uploaded methodology PDFs
  },
};

export default nextConfig;
