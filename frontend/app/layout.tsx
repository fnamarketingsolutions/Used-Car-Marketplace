import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import ConditionalChrome from "@/components/ConditionalChrome";
import NavigationProgress from "@/components/NavigationProgress";
import { AuthProvider } from "@/lib/auth/AuthProvider";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Used Car Marketplace",
  description:
    "Buy and sell verified used cars with clear listings and a seller dashboard.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <AuthProvider>
          <NavigationProgress />
          <ConditionalChrome>{children}</ConditionalChrome>
          <Toaster richColors position="top-right" closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}
