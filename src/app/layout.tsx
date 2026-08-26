import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ColorLab | Color Scale Generator",
  description:
    "Generate beautiful color scales for your product designs and export your color tokens for development and Figma.",
  openGraph: {
    title: "ColorLab | Color Scale Generator",
    description:
      "Generate beautiful color scales for your product designs and export your color tokens for development and Figma.",
    url: "https://colorscale-generator.vercel.app",
    siteName: "ColorLab",
    type: "website",
    images: [
      {
        url: "../app/icon.png",
        width: 1200,
        height: 630,
        alt: "ColorLab color scale generator",
      },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
