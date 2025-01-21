const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');

// Define your website's base URL
const baseUrl = 'https://www.getchatters.com';

// Define your routes based on the routes in your App.js
const routes = [
    // Highest priority (1.0)
    { url: '/', changefreq: 'weekly', priority: 1.0 }, // Homepage is always the highest priority
  
    // High priority (0.9)
    { url: '/features', changefreq: 'monthly', priority: 0.9 }, // Features overview page
    { url: '/features/real-time-stats', changefreq: 'monthly', priority: 0.9 }, // Key feature
    { url: '/features/custom-branding', changefreq: 'monthly', priority: 0.9 }, // Key feature
    { url: '/features/custom-questions', changefreq: 'monthly', priority: 0.9 }, // Key feature
    { url: '/features/dashboards', changefreq: 'monthly', priority: 0.9 }, // Key feature
    { url: '/features/qr-codes', changefreq: 'monthly', priority: 0.9 }, // Key feature
    { url: '/features/nps-score', changefreq: 'monthly', priority: 0.9 }, // Key feature
  
    // Medium priority (0.8)
    { url: '/pricing', changefreq: 'monthly', priority: 0.8 }, // Pricing page is important for conversions
    { url: '/demo', changefreq: 'monthly', priority: 0.8 }, // Demo page is important for conversions
    { url: '/contact', changefreq: 'monthly', priority: 0.8 }, // Contact page is important for user engagement
    { url: '/about', changefreq: 'monthly', priority: 0.8 }, // About page is important for branding
  
    // Lower priority (0.7)
    { url: '/signup', changefreq: 'monthly', priority: 0.7 }, // Signup page
    { url: '/signin', changefreq: 'monthly', priority: 0.7 }, // Signin page
    { url: '/forgot-password', changefreq: 'monthly', priority: 0.7 }, // Forgot password page
    { url: '/reset-password', changefreq: 'monthly', priority: 0.7 }, // Reset password page
    { url: '/security', changefreq: 'monthly', priority: 0.7 }, // Security page
    { url: '/terms', changefreq: 'monthly', priority: 0.7 }, // Terms and conditions
    { url: '/privacy', changefreq: 'monthly', priority: 0.7 }, // Privacy policy
  ];

// Create a sitemap stream
const sitemap = new SitemapStream({ hostname: baseUrl });

// Write the sitemap to a file
const writeStream = createWriteStream('./public/sitemap.xml');
sitemap.pipe(writeStream);

// Add routes to the sitemap
routes.forEach(route => sitemap.write(route));

// End the stream
sitemap.end();

console.log('Sitemap generated successfully!');