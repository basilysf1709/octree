import type { Metadata } from "next";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./context/UserContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Octree",
  description: "A version-controlled document editor",
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
