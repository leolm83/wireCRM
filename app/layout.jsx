import { Manrope } from "next/font/google";
import "./globals.css";

// Manrope é a fonte definida no design.md.
// Este import baixa a fonte na hora do build e serve ela junto com o site,
// então a página não depende do Google para carregar.
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

// Título que aparece na aba do navegador.
export const metadata = {
  title: "Meu CRM",
  description: "Contatos e oportunidades de negócio em um só lugar.",
};

// Este arquivo é a "moldura" de todas as telas: tudo que for criado
// daqui pra frente aparece dentro de {children}.
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={manrope.className}>
      <body>{children}</body>
    </html>
  );
}
