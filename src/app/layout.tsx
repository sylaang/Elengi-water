import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./providers/auth-provider";
import { Navbar } from "./components/layout/navbar";
import { Header } from "./components/layout/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Elengi Water",
  description: "Gestion des finances pour Elengi Water",
};

export default function RootLayout({ children }: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" data-theme="light">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <Header />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
