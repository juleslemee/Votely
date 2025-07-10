import type { Metadata, Viewport } from "next";
import { Ubuntu, Noto_Sans } from "next/font/google";
import "./globals.css";
import GoogleTagManager from "@/lib/GoogleTagManager";

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
};

export const metadata: Metadata = {
  title: {
    template: '%s',
    default: 'Votely - Take Quiz',
  },
  description: "Discover your political engagement style with our quick quiz",
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
        <GoogleTagManager />
        {children}
      </body>
    </html>
  );
}
