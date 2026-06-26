import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['firebase-admin', 'jose', 'jwks-rsa'],
};

export default nextConfig;