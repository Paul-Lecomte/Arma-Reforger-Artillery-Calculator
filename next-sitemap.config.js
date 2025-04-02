/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: "https://arma-reforger-artillery-calculator.vercel.app", // Update this if using a custom domain
    generateRobotsTxt: true,
    sitemapSize: 5000, // Prevents splitting into multiple files
};