import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Radar Argentina – Regulaciones & Certificaciones",
  description: "Actualizaciones públicas con posible impacto en Argentina",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
