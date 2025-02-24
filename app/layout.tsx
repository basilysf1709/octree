import type { Metadata } from "next";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./context/UserContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Octree",
  description: "A version-controlled document editor",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
