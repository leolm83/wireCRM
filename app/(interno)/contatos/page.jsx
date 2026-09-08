import { exigirSessao } from "@/lib/sessao";
import FormularioContato from "../../formulario-contato";
import ListaContatos from "../../lista-contatos";

// Cada tela confere a sessão por conta própria — ver a nota dentro da
// função. O layout de (interno) confere também, como segunda camada.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contatos — WireCRM",
};

export default async function PaginaDeContatos() {
  // Confere a sessão aqui, na própria tela, e não só no layout de (interno).
  // O layout do Next não é redesenhado quando se navega de uma tela para
  // outra vizinha — então confiar só nele deixaria esta tela abrir com a
  // sessão já vencida. Uma linha aqui fecha essa brecha.
  await exigirSessao();

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
