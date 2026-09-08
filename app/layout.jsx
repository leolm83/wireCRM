import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// As duas fontes do design.md. Este import baixa cada uma na hora do build e
// serve junto com o site, então a página não depende do Google para carregar.
//
// "variable" publica a fonte como uma variável de CSS. É assim que o
// globals.css consegue pedir a monoespaçada só onde ela deve entrar
// (números, contadores, etiquetas técnicas) sem mexer no resto.

// Manrope: a voz do sistema — títulos, textos, botões.
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--fonte",
  display: "swap",
});

// JetBrains Mono: o toque técnico.
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--fonte-mono",
  display: "swap",
});

// Título que aparece na aba do navegador.
export const metadata = {
  title: "WireCRM",
  description: "Contatos e oportunidades de negócio em um só lugar.",
};

// Este arquivo é a "moldura" de todas as telas: tudo que for criado
// daqui pra frente aparece dentro de {children}.
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
