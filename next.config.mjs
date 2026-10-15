import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const API_URL = process.env.API_URL || 'http://localhost:5001';


const nextConfig = {
  reactStrictMode: true,
  turbopack: { root: path.dirname(fileURLToPath(import.meta.url)) },
  poweredByHeader: false,
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Admin uploads (brochure PDFs, images) go through the /api rewrite; the default proxy body limit is 10 MB.
  experimental: { proxyClientMaxBodySize: '20mb' },
  async rewrites() {
    // Browser talks to same origin; Next proxies API + uploaded files to the Node backend.
    return [
      { source: '/api/:path*', destination: `${API_URL}/api/:path*` },
      { source: '/uploads/:path*', destination: `${API_URL}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
