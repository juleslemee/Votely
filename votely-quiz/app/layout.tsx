import type { Metadata, Viewport } from "next";
import { Ubuntu, Noto_Sans } from "next/font/google";
import "./globals.css";
import GoogleTagManager from "@/lib/GoogleTagManager";
import HotJar from "@/lib/HotJar";
import StructuredData from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PostHogProvider } from "@/components/PostHogProvider";

const ubuntu = Ubuntu({
  weight: ['300', '400', '500', '700'],
  subsets: ["latin"],
  variable: '--font-ubuntu',
});

const notoSans = Noto_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: '--font-noto',
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL('https://votelyquiz.com'),
  title: {
    template: '%s | The Votely Political Quiz',
    default: 'The Votely Political Quiz - Most Accurate 3D Political Compass Test | 39 Axes',
  },
  description: "Take the most accurate political quiz with 39 total axes, 81 ideologies, and 3D cube visualization. Better than Political Compass, 8values, or 12axes. Choose 10 or 50 questions.",
  keywords: ['political compass alternative', '3D political quiz', 'most accurate political quiz', '39 axes political test', '81 ideologies', 'political compass test better than', 'votely quiz', 'jules lemee'],
  authors: [{ name: 'Jules Lemee', url: 'https://juleslemee.com' }],
  creator: 'Jules Lemee',
  publisher: 'Jules Lemee',
  alternates: {
    canonical: 'https://votelyquiz.com',
  },
  openGraph: {
    title: 'The Votely Political Quiz - Most Accurate 3D Political Compass',
    description: 'Discover your position among 81 ideologies with the most advanced political quiz. 39 axes, percentage sliders, 3D visualization.',
    url: 'https://votelyquiz.com',
    siteName: 'Votely Political Quiz',
    images: [
      {
        url: '/Logo.png',
        width: 1200,
        height: 630,
        alt: 'Votely Political Quiz Logo',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Votely Political Quiz - 3D Political Compass',
    description: 'Most accurate political quiz: 39 axes, 81 ideologies, 3D visualization',
    images: ['/Logo.png'],
    creator: '@juleslemee',
  },
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      }
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      }
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/logo.svg",
      }
    ]
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Votely",
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'msapplication-TileColor': '#B07DD5',
    'msapplication-TileImage': '/mstile-144x144.png',
    'msapplication-config': '/browserconfig.xml',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ubuntu.variable} ${notoSans.variable} antialiased`}
        suppressHydrationWarning
      >
        <PostHogProvider>
          <GoogleTagManager />
          <HotJar />
          <StructuredData />
          <Breadcrumbs />
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}