"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Roda no navegador só para saber em qual página estamos e destacar
// o link correspondente.

export default function NavbarLinks({ mostrarUsuarios }) {
  const caminho = usePathname();

  const paginas = [
    { href: "/", rotulo: "Painel" },
    { href: "/contatos", rotulo: "Contatos" },
    ...(mostrarUsuarios ? [{ href: "/usuarios", rotulo: "Usuários" }] : []),
  ];

  return (
    <div className="navbar-links">
      {paginas.map((pagina) => (
        <Link
          key={pagina.href}
          href={pagina.href}
          className={caminho === pagina.href ? "navbar-link ativo" : "navbar-link"}
        >
          {pagina.rotulo}
        </Link>
      ))}
    </div>
  );
}
