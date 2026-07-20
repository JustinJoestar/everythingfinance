import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Besley, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getSessionUser, getStreak } from "@/lib/data";

import "./globals.css";

// Type system: Besley is a Clarendon — the letterform of 19th-century bank
// ledgers — for headlines; Plex Sans carries the UI; Plex Mono is the data
// voice (timestamps, counters, labels).
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const besley = Besley({
  variable: "--font-besley",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Everything Finance: finance news, explained simply",
    template: "%s · Everything Finance",
  },
  description:
    "Finance news summarized in plain English: stocks, crypto, macro, and world events, with flashcards, quizzes, and a glossary to help you remember what you read.",
  openGraph: {
    title: "Everything Finance",
    description:
      "Finance news in plain English, plus learning tools that help it stick.",
    siteName: "Everything Finance",
    type: "website",
  },
};

// Flips dark mode before first paint (no flash), honoring the saved choice
// or the system preference.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, streak] = await Promise.all([getSessionUser(), getStreak()]);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plexSans.variable} ${besley.variable} ${plexMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Header
          userEmail={user?.email ?? null}
          streakDays={streak?.current_streak ?? 0}
        />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
