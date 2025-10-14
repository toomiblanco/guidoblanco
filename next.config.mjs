/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Configuraciones EXTREMAS para manejar contenido muy extenso (100+ páginas)
  experimental: {
    largePageDataBytes: 1024 * 1024, // 1MB (aumentado desde 256KB)
  },
  // En Next.js 14+ con App Router, los límites de request se manejan a nivel de ruta
  // Los límites de 50MB se configuran directamente en cada route handler
}

export default nextConfig
