import localFont from "next/font/local";
import "./globals.css";
import { config } from "@/lib/config";

const display = localFont({
  src: "../fonts/BricolageGrotesque.ttf",
  variable: "--font-display",
  display: "swap",
});

const body = localFont({
  src: "../fonts/PublicSans.ttf",
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  title: `${config.institucion.nombre} — Solicitud de alimentación`,
  description: config.institucion.subtitulo,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
