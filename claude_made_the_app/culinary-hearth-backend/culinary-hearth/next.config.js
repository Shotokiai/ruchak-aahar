/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'images.unsplash.com',
      'lh3.googleusercontent.com',  // Google profile pictures
      'spoonacular.com',
      'img.spoonacular.com',
    ],
  },
};

module.exports = nextConfig;
