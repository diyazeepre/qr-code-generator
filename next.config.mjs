const allowedDevOrigins = [
  '127.0.0.1',
  'localhost',
  '*.localhost',
  '**.localhost',
  '*.run.app',
  '**.run.app',
  '*.asia-east1.run.app',
  '**.asia-east1.run.app',
];

if (process.env.APP_URL) {
  try {
    allowedDevOrigins.push(new URL(process.env.APP_URL).hostname);
  } catch {
    // ignore invalid APP_URL
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
