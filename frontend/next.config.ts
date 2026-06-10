import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  transpilePackages: ['@kas/backend'],
  serverExternalPackages: ['@libsql/client', 'drizzle-orm'],
  allowedDevOrigins: ['192.168.110.206'],
  turbopack: {},
};

export default withPWA(nextConfig);
