import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Enhanced experimental features
  experimental: {
    serverActions: true,
    optimizePackageImports: [
      "@radix-ui/react-dialog",
      "@radix-ui/react-select",
      "lucide-react",
      "@radix-ui/react-toast",
      "@radix-ui/react-tooltip"
    ],
    typedRoutes: true,
    instrumentationHook: true,
    optimizeServerReact: true,
    dynamicIO: true,
    serverComponentsExternalPackages: ["@sentry/nextjs", "sharp"],
  },

  // Enhanced images configuration
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
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudfront.net",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400, // 24 hours
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Enhanced logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Enhanced headers with security improvements
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
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
      ],
    },
    // API route specific headers
    {
      source: "/api/:path*",
      headers: [
        {
          key: "Access-Control-Allow-Origin",
          value: process.env.NEXT_PUBLIC_APP_URL || "https://yourapp.com",
        },
        {
          key: "Access-Control-Allow-Methods",
          value: "GET, POST, PUT, DELETE, OPTIONS",
        },
        {
          key: "Access-Control-Allow-Headers",
          value: "Content-Type, Authorization",
        },
      ],
    },
  ],

  // Enhanced webpack configuration
  webpack: (config, { isServer, dev, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
      };
    }

    // SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    // Bundle analyzer in development
    if (dev && process.env.ANALYZE === "true") {
      const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "server",
          analyzerPort: 8888,
          openAnalyzer: true,
        })
      );
    }

    // Optimize moment.js and other large libraries
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      })
    );

    return config;
  },

  // Enhanced transpile packages
  transpilePackages: [
    "@radix-ui/react-slot",
    "class-variance-authority",
    "tailwind-merge",
    "clsx",
    "date-fns",
    "lodash-es",
  ],

  // Enhanced modularize imports
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{ kebabCase member }}",
    },
    "date-fns": {
      transform: "date-fns/{{ member }}",
    },
    "lodash-es": {
      transform: "lodash-es/{{ member }}",
    },
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
    reactRemoveProperties: process.env.NODE_ENV === "production" ? {
      properties: ["^data-testid$"],
    } : false,
  },

  // Environment variables exposed to the browser
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    APP_VERSION: process.env.npm_package_version,
  },

  // Redirects configuration
  async redirects() {
    return [
      {
        source: "/old-path",
        destination: "/new-path",
        permanent: true,
      },
      {
        source: "/docs",
        destination: "/documentation",
        permanent: false,
      },
    ];
  },

  // Rewrites configuration
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${process.env.API_BASE_URL || "https://api.example.com"}/:path*`,
      },
    ];
  },

  // Sentry configuration
  sentry: {
    hideSourceMaps: true,
    widenClientFileUpload: true,
    tunnelRoute: "/monitoring",
    disableServerWebpackPlugin: process.env.NODE_ENV === "development",
    disableClientWebpackPlugin: process.env.NODE_ENV === "development",
  },

  // Output configuration
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
  
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  
  // Cache configuration
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

// Performance monitoring with conditional Sentry
const configWithMonitoring = process.env.SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      // Additional Sentry configuration
      widenClientFileUpload: true,
      transpileClientSDK: true,
      tunnelRoute: "/monitoring",
      hideSourceMaps: true,
      disableLogger: true,
      automaticVercelMonitors: true,
    })
  : nextConfig;

// Export configuration with runtime environment validation
export default function getConfig() {
  // Validate required environment variables in production
  if (process.env.NODE_ENV === "production") {
    const requiredEnvVars = [
      'NEXT_PUBLIC_APP_URL',
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables in production: ${missingVars.join(', ')}`
      );
    }
  }

  return configWithMonitoring;
}
