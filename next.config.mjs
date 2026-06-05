/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disabled: Strict Mode double-invokes effects which conflicts with our
  // canvas/rAF/image-preload pipeline and triggers spurious HMR removeChild
  // errors after edits to ScrollFrames.tsx. Re-enable for production audits.
  reactStrictMode: false,
};

export default nextConfig;
