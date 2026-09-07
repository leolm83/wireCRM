import { supabase } from "@/lib/supabase";

// Página inicial: o funil em números.
export const dynamic = "force-dynamic";

// As quatro etapas, na ordem do funil. A classe traz a cor de cada uma,
// definida no design.md e escrita no globals.css.
const ETAPAS = [
  { chave: "novo", classe: "numero-novo" },
  { chave: "em contato", classe: "numero-em-contato" },
  { chave: "proposta", classe: "numero-proposta" },
  { chave: "cliente", classe: "numero-cliente" },
];

export default async function PaginaInicial() {
  // Traz só a coluna da etapa e conta aqui. Uma consulta em vez de cinco,
  // e a coluna é pequena — se um dia forem milhares de contatos, vale
  // trocar por uma contagem feita pelo banco.
  const { data, error } = await supabase.from("contatos").select("etapa");

  if (error) {
    return (
      <main className="pagina">
        <header className="cabecalho">
          <h1>Meu CRM</h1>
        </header>
        <div className="aviso">Não consegui buscar os números no banco.</div>
      </main>
    );
  }

  const contatos = data ?? [];
  const total = contatos.length;

  const contagem = {};
  for (const etapa of ETAPAS) {
    contagem[etapa.chave] = contatos.filter(
      (contato) => contato.etapa === etapa.chave
    ).length;
  }

  return (
    <main className="pagina">
      <header className="cabecalho">
        <h1>Meu CRM</h1>
        <p className="apoio">Onde está cada oportunidade agora.</p>
      </header>

      <section className="painel">
        <div className="painel-total">
          <p className="painel-rotulo">Total de contatos</p>
          <p className="painel-numero-total">{total}</p>
        </div>

        <div className="painel-etapas">
          {ETAPAS.map((etapa) => (
            <div key={etapa.chave} className="painel-etapa">
              <p className={`painel-numero ${etapa.classe}`}>
                {contagem[etapa.chave]}
              </p>
              <p className="painel-rotulo">{etapa.chave}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
