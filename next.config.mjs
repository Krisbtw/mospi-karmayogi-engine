/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['unpdf', 'mammoth', 'jszip'],
    serverActions: { bodySizeLimit: "15mb" }, // headroom for uploaded methodology PDFs
  },
};

export default nextConfig;
