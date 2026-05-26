import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Type checking is handled separately; don't fail the build on type errors
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  serverExternalPackages: ["pdfjs-dist", "mammoth"],
};

export default nextConfig;