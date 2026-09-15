import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { SessionProvider } from "@/lib/auth/session-provider"
import { createClient } from "@/lib/supabase/server"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "School MVP",
  description: "School attendance and admin",
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <SessionProvider
          user={user ? { id: user.id, email: user.email } : null}
        >
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
