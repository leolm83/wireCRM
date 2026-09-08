"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// As áreas do sistema, na navegação lateral.
//
// Roda no navegador só para saber em qual área estamos e destacar o item
// correspondente. Área nova é uma linha a mais na lista abaixo.

export default function LateralLinks({ mostrarUsuarios }) {
  const caminho = usePathname();

  const areas = [
    { href: "/", rotulo: "Dashboard" },
    { href: "/funil", rotulo: "Funil" },
    { href: "/contatos", rotulo: "Contatos" },
    ...(mostrarUsuarios ? [{ href: "/usuarios", rotulo: "Usuários" }] : []),
  ];

  return (
    <nav className="lateral-nav" aria-label="Áreas do sistema">
      {areas.map((area) => {
        const ativo = caminho === area.href;

        return (
          <Link
            key={area.href}
            href={area.href}
            className={ativo ? "lateral-link ativo" : "lateral-link"}
            // Diz ao leitor de tela qual é a área aberta agora.
            aria-current={ativo ? "page" : undefined}
          >
            {area.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
