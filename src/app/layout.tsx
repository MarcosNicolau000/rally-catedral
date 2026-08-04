import './globals.css';
import type { Metadata, Viewport } from 'next';
import { OfflineBanner } from '@/presentation/components/OfflineBanner';

export const metadata: Metadata = {
  title: 'Rally — Sistema de Pontuação',
  description: 'Sistema de pontuação e competição de Nações e Tribos.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Rally',
  },
};

export const viewport: Viewport = {
  themeColor: '#090d16',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <OfflineBanner />
        {children}
        {/* Registro do Service Worker no client-side */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) { console.log('[SW] Registrado:', reg.scope); })
                    .catch(function(err) { console.warn('[SW] Erro:', err); });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
