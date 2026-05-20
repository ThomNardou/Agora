
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RootLayoutClient from "@/app/layout-client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agora - Platforme de gestion de newsletters",
  description: "Agora est une plateforme moderne de gestion de newsletters, conçue pour simplifier la création, l'envoi et l'analyse de vos campagnes de communication. Avec Agora, vous pouvez facilement créer des newsletters attrayantes, gérer votre liste de lecteurs et suivre les performances de vos campagnes grâce à des statistiques détaillées. Notre interface intuitive et nos fonctionnalités avancées vous permettent de rester connecté avec votre audience et d'optimiser l'impact de vos communications.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="fr">
      <RootLayoutClient geistSans={geistSans} geistMono={geistMono}>

        {children}

      </RootLayoutClient>
    </html>
  );
}
