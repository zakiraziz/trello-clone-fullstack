import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
    optimizePackageImports: [
      "@radix-ui/react-dialog",
      "@radix-ui/react-select",
      "lucide-react"
    ],
    typedRoutes: true,
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.example.com",
      },
      {
        protocol: "https",
        hostname: "**.githubusercontent.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400, // 24 hours
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "X-DNS-Prefetch-Control",
          value: "on",
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
        {
          key: "X-XSS-Protection",
          value: "1; mode=block",
        },
      ],
    },
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }

    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
  transpilePackages: [
    "@radix-ui/react-slot",
    "class-variance-authority",
    "tailwind-merge",
  ],
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{ kebabCase member }}",
    },
  },
  sentry: {
    hideSourceMaps: true,
  },
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
};

// Conditionally add Sentry config if SENTRY_DSN is present
const configWithSentry = process.env.SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    })
  : nextConfig;

export default configWithSentry;
