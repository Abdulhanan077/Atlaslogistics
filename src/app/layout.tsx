import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";
import GoogleTranslate from "@/components/GoogleTranslate";

export const metadata: Metadata = {
  title: "Atlas Logistics",
  description: "Secure multi-tenant logistics and shipment tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans" suppressHydrationWarning>
        <Providers>
          <GoogleTranslate />
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
