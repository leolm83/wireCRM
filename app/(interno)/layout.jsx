import { exigirSessao } from "@/lib/sessao";
import { sair } from "../acoes-login";
import LateralLinks from "./lateral-links";

// Moldura das páginas de dentro do sistema: cabeçalho no topo, navegação
// lateral à esquerda, e a tela da vez à direita.
//
// A pasta se chama (interno) entre parênteses: isso agrupa as páginas sem
// aparecer no endereço. A vantagem é que a verificação abaixo vale para
// TODAS elas — uma página nova criada aqui dentro já nasce protegida.

export default async function LayoutInterno({ children }) {
  const usuario = await exigirSessao();

  return (
    <div className="app">
      <header className="cabecalho-app">
        <span className="marca">WireCRM</span>

        <div className="cabecalho-app-direita">
          <span className="usuario-logado">
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
      </header>

      <div className="app-corpo">
        <aside className="lateral">
          {/* A área de usuários só aparece para quem pode entrar nela. */}
          <LateralLinks mostrarUsuarios={usuario.papel === "admin"} />
        </aside>

        <div className="conteudo">{children}</div>
      </div>
    </div>
  );
}
