import type { NextConfig } from "next";

// Product photos uploaded via /admin/api/upload live in Supabase Storage
// (public bucket "ns-product-images") and are rendered through next/image,
// which requires the remote host to be explicitly allowlisted.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHostname
      ? [{ protocol: "https", hostname: supabaseHostname, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
};

export default nextConfig;
