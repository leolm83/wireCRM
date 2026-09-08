import { exigirAdmin } from "@/lib/sessao";
import { listarUsuarios } from "@/lib/usuarios";
import BotaoAprovar from "./botao-aprovar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Usuários — WireCRM",
};

const FORMATO_DE_DATA = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

export default async function PaginaDeUsuarios() {
  // Além da sessão exigida pelo layout, esta página exige ser admin.
  const eu = await exigirAdmin();

  const usuarios = await listarUsuarios();

  if (!usuarios) {
    return (
      <main className="pagina">
        <div className="aviso">Não consegui buscar os usuários no banco.</div>
      </main>
    );
  }

  const pendentes = usuarios.filter((u) => u.status === "pendente");
  const aprovados = usuarios.filter((u) => u.status === "aprovado");

  return (
    <main className="pagina">
      <header className="cabecalho">
        <h1>Usuários</h1>
        <p className="apoio">
          Quem pede acesso entra aqui como pendente. Só depois da sua
          aprovação a pessoa consegue usar o CRM.
        </p>
      </header>

      <section className="secao-lista">
        <h2>Aguardando aprovação</h2>

        {pendentes.length === 0 ? (
          <div className="aviso">Ninguém esperando aprovação no momento.</div>
        ) : (
          <div className="lista-contatos">
            {pendentes.map((usuario) => (
              <article key={usuario.id} className="contato">
                <div className="contato-linha">
                  <div className="contato-info">
                    <p className="contato-nome">{usuario.usuario}</p>
                    <p className="contato-dados">
                      Pediu acesso em{" "}
                      <span className="mono">
                        {FORMATO_DE_DATA.format(new Date(usuario.criado_em))}
                      </span>
                    </p>
                  </div>
                  <div className="contato-direita">
                    <BotaoAprovar id={usuario.id} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="secao-lista">
        <h2>Com acesso</h2>

        <div className="lista-contatos">
          {aprovados.map((usuario) => (
            <article key={usuario.id} className="contato">
              <div className="contato-linha">
                <div className="contato-info">
                  <p className="contato-nome">
                    {usuario.usuario}
                    {usuario.id === eu.id && (
                      <span className="marca-voce">você</span>
                    )}
                  </p>
                  <p className="contato-dados">
                    Desde{" "}
                    <span className="mono">
                      {FORMATO_DE_DATA.format(new Date(usuario.criado_em))}
                    </span>
                  </p>
                </div>
                <div className="contato-direita">
                  <span
                    className={
                      usuario.papel === "admin"
                        ? "etiqueta etiqueta-admin"
                        : "etiqueta etiqueta-comum"
                    }
                  >
                    {usuario.papel}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
