/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["framer-motion", "motion-dom", "motion-utils"],
  reactStrictMode: false,
};

export default nextConfig;
