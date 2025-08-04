const config = {
  plugins: [
    // Import handling
    'postcss-import', 
    'postcss-import-ext-glob', // Adds glob import support (@import 'components/**/*.css')
    
    // Tailwind CSS ecosystem
    'tailwindcss/nesting', 
    '@tailwindcss/postcss',
    '@tailwindcss/forms', // Adds better form element styling
    '@tailwindcss/typography', // Adds prose class for rich text
    '@tailwindcss/container-queries', // Adds container query support
    
    // Future CSS features
    'postcss-preset-env', 
    
    // Vendor prefixing and bug fixes
    'autoprefixer',
    'postcss-flexbugs-fixes',
    
    // Advanced features
    'postcss-combine-media-query', // Combines duplicate media queries
    'postcss-combine-duplicated-selectors', // Combines duplicate selectors
    'postcss-sort-media-queries', // Sorts media queries for better compression
    
    // Custom properties/transformations
    'postcss-custom-properties', // Preserves CSS variables when needed
    'postcss-attribute-case-insensitive', // Handles case-insensitive attributes
    
    // Production-only plugins
    ...(process.env.NODE_ENV === 'production' ? [
      'cssnano', // Minification
      'postcss-zindex', // Optimizes z-index values
      'postcss-discard-unused', // Removes unused CSS rules
      'postcss-merge-rules', // Merges identical CSS rules
    ] : []),
  ],
  
  // Plugin configurations
  ...(process.env.NODE_ENV === 'production' ? {
    cssnano: {
      preset: ['advanced', {
        discardComments: { removeAll: true },
        reduceIdents: false, // Disable to prevent keyframes/variable renaming
        zindex: false, // Handled by postcss-zindex separately
        mergeIdents: false, // Safer to disable
      }]
    },
    'postcss-zindex': {
      startIndex: 1000, // Base z-index value
    },
  } : {}),
  
  // Syntax and source maps
  syntax: 'postcss-scss', // Supports SCSS-like syntax
  map: process.env.NODE_ENV !== 'production' ? {
    inline: false, // Generate external sourcemaps
    annotation: true, // Add sourcemap URL comment
  } : false,
  
  // PostCSS preset-env configuration
  'postcss-preset-env': {
    stage: 3, // Enable stable CSS features
    features: {
      'nesting-rules': true, // Already handled by tailwindcss/nesting
      'custom-media-queries': true,
      'media-query-ranges': true,
      'logical-properties-and-values': true,
      'color-functional-notation': true,
    },
    autoprefixer: {
      flexbox: 'no-2009', // Don't add old flexbox prefixes
      grid: 'autoplace', // Handle CSS Grid for IE
    },
    browsers: 'last 2 versions, not dead, > 0.5%', // Default browserlist
  },
  
  // Watch configuration (for development)
  ...(process.env.NODE_ENV !== 'production' ? {
    watch: true,
    // Live reload configuration
    live: {
      patterns: ['src/**/*.css', 'src/**/*.scss'],
      ignore: ['**/node_modules/**'],
    },
  } : {}),
};

export default config;
