import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { AuthProvider } from "@/lib/providers/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DATN - Decentralized Autonomous Trade Network.",
  description: "The Best Decentalized Goods Trade Network.",
  icons: {
    icon: "/xtra-games.png", // ✅ Correct path (public/xtra-games.png)
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <QueryProvider>
            <AuthProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
              >
                <div className="flex flex-col min-h-screen">
                  {/* Navigation Bar */}
                  <Navbar />

                  {/* Main Content */}
                  <main className="flex-1">
                    <ProtectedRoute>{children}</ProtectedRoute>
                  </main>

                  {/* Footer */}
                  <Footer />
                </div>
                <Toaster />
              </ThemeProvider>
            </AuthProvider>
          </QueryProvider>
        </Providers>
      </body>
    </html>
  );
}
