import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import TopNav from "@/components/layout/top-nav"
import { LanguageProvider } from "@/lib/i18n/language-context"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NutriSense – Helse og ernæring",
  description:
    "Spor måltid, aktivitet og helse med AI-analyse. Last opp bilete av maten din og få næringsinnhald på sekundet.",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NutriSense",
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="no">
      <body className={`font-sans antialiased`}>
        <LanguageProvider>
          <TopNav />
          <main>{children}</main>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
