

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "flagcdn.com" },
    ],
  },
  webpack(config) {
    // wagmi v3 connectors barrel imports optional peer deps — ignore them at build time
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "porto/internal": false,
      "@metamask/connect-evm": false,
      "@safe-global/safe-apps-sdk": false,
    };
    return config;
  },
};

export default nextConfig;
