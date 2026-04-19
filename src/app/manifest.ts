import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: SITE.tagline_kk,
    start_url: '/kk',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f766e',
    lang: 'kk',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
