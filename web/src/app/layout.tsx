import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: { template: "%s | FreedomPodcasting", default: "FreedomPodcasting — Production Studio" },
  description: "Professional podcast hosting and AI-powered production tools.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://app.freedompodcasting.com"),
  icons: {
    icon: "/freedom-podcasting-square-logo.png",
    apple: "/freedom-podcasting-square-logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
      <GoogleAnalytics gaId="G-8MXS2FJ930" />
    </html>
  );
}
