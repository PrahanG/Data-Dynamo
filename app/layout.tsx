import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CargoVision',
  description: 'Advanced AI-Driven Logistics & Load Optimization',
  icons: '/logo_cargovision.jpg',
  generator: 'Prahan',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
