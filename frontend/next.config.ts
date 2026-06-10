import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@kas/backend'],
  serverExternalPackages: ['@libsql/client', 'drizzle-orm'],
  allowedDevOrigins: ['192.168.110.206'],
};

export default nextConfig;
