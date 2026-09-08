import FormularioContato from "../../formulario-contato";
import ListaContatos from "../../lista-contatos";

// A proteção fica no layout desta pasta — toda página aqui dentro já
// exige sessão antes de rodar.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contatos — WireCRM",
};

export default function PaginaDeContatos() {
  return (
    <main className="pagina">
      <header className="cabecalho">
        <h1>Contatos</h1>
        <p className="apoio">
          Contatos e oportunidades de negócio em um só lugar.
        </p>
      </header>

      <section className="cartao">
        <h2>Novo contato</h2>
        <FormularioContato />
      </section>

      <section className="secao-lista">
        <h2>Contatos</h2>
        <ListaContatos mensagemVazia="Nenhum contato ainda. Cadastre o primeiro no formulário acima." />
      </section>
    </main>
  );
}
