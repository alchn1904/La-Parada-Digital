import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Cabecera } from "@/components/Cabecera";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "La Parada Digital",
  description: "Plataforma para ordenar el ingreso, el estibaje y la inspección sanitaria del mercado de La Parada.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-slate-50 font-sans text-slate-900">
        <Cabecera />
        {children}
        <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          La Parada Digital · Proyecto Final de Carrera III · USIL
        </footer>
      </body>
    </html>
  );
}
