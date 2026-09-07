import { exigirSessao } from "@/lib/sessao";
import { sair } from "../acoes-login";
import NavbarLinks from "./navbar-links";

// Moldura das páginas de dentro do sistema.
//
// A pasta se chama (interno) entre parênteses: isso agrupa as páginas sem
// aparecer no endereço. A vantagem é que a verificação abaixo vale para
// TODAS elas — uma página nova criada aqui dentro já nasce protegida.

export default async function LayoutInterno({ children }) {
  const usuario = await exigirSessao();

  return (
    <>
      <nav className="navbar">
        <div className="navbar-conteudo">
          {/* A área de usuários só aparece para quem pode entrar nela. */}
          <NavbarLinks mostrarUsuarios={usuario.papel === "admin"} />

          <div className="navbar-direita">
            <span className="navbar-usuario">
              {usuario.usuario}
              {usuario.papel === "admin" && (
                <span className="etiqueta-papel">admin</span>
              )}
            </span>
            <form action={sair}>
              <button type="submit" className="botao-texto">
                Sair
              </button>
            </form>
          </div>
        </div>
      </nav>

      {children}
    </>
  );
}
