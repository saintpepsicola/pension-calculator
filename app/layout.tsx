import type { Metadata } from "next"
import { Manrope } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Pension Tracker",
  description: "A simple pension tracker application",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html 
      lang="en" 
      className={cn("h-full w-full", manrope.variable)}
      suppressHydrationWarning
    >
      <body className="relative h-full w-full font-sans antialiased">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="min-h-screen ">{children}</div>
      </body>
    </html>
  )
}
