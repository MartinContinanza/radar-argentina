import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Radar – Sustentabilidad & Certificaciones",
  description: "Inteligencia regulatoria para el agro y comercio exterior argentino",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
