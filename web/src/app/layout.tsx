import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";

export const metadata: Metadata = {
  title: { template: "%s | FreedomPodcasting", default: "FreedomPodcasting — Production Studio" },
  description: "Professional podcast hosting and AI-powered production tools.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://app.freedompodcasting.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
