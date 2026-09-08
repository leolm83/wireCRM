import ListaContatos from "../../lista-contatos";

// O funil: todos os contatos, com a etapa de cada um, as anotações e o
// follow-up. A proteção fica no layout desta pasta — toda página aqui
// dentro já exige sessão antes de rodar.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Funil — WireCRM",
};

export default function PaginaDoFunil() {
  return (
    <main className="pagina">
      <header className="cabecalho">
        <h1>Funil</h1>
        <p className="apoio">Em que pé está cada conversa.</p>
      </header>

      <section className="secao-lista">
        <ListaContatos mensagemVazia="Nenhum contato ainda. Cadastre o primeiro na área de Contatos." />
      </section>
    </main>
  );
}
