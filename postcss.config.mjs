const config = {
  plugins: [
    "postcss-import", // Allows you to use @import rules
    "tailwindcss/nesting", // Adds support for CSS nesting (or use postcss-nested)
    "@tailwindcss/postcss",
    "autoprefixer", // Automatically adds vendor prefixes
    "postcss-flexbugs-fixes", // Fixes flexbox issues
    "postcss-preset-env", // Allows future CSS features to be used today
    "cssnano" // Minifies CSS in production
  ],
  
  // Optional configuration for specific plugins
  ...(process.env.NODE_ENV === 'production' ? {
    cssnano: {
      preset: ['default', {
        discardComments: {
          removeAll: true
        }
      }]
    }
  } : {}),
  
  // Other PostCSS configuration options
  syntax: 'postcss-scss', // If you're using SCSS syntax
  map: process.env.NODE_ENV !== 'production' // Generate source maps in development
};

export default config;
