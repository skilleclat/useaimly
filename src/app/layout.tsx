import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Newsreader, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

const serifFont = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://useaimly.com"),
  title: {
    default: "UseAimly — See Tomorrow Before Deciding Today",
    template: "%s | UseAimly",
  },
  description:
    "Goal-aware personal finance decision intelligence platform. Simulate spending impacts deterministically on your future life destinations.",
  applicationName: "UseAimly",
  authors: [{ name: "UseAimly Team", url: "https://useaimly.com" }],
  keywords: [
    "personal finance",
    "decision intelligence",
    "financial forecasting",
    "goal planning",
    "cash flow simulation",
    "budgeting alternative",
    "deterministic finance",
    "UseAimly",
  ],
  creator: "UseAimly",
  publisher: "UseAimly",
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["fr_FR"],
    url: "https://useaimly.com",
    siteName: "UseAimly",
    title: "UseAimly — See Tomorrow Before Deciding Today",
    description:
      "Goal-aware decision intelligence platform. Protect your liquidity and simulate spending impact before purchasing.",
  },
  twitter: {
    card: "summary_large_image",
    title: "UseAimly — See Tomorrow Before Deciding Today",
    description: "Goal-aware financial decision intelligence. Simulate spending impacts on your destinations.",
    creator: "@useaimly",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://useaimly.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sansFont.variable} ${serifFont.variable} ${monoFont.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased text-foreground selection:bg-primary/20 selection:text-primary transition-colors duration-200">
        <AppProviders>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
