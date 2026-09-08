import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { tempoDesde } from "@/lib/tempo";

// Dashboard: o funil em números, em distribuição, e quem entrou por último.
//
// "force-dynamic" faz esta tela ser montada a cada visita, então ela já
// nasce com o número certo. As ações que gravam no banco também mandam o
// Next redesenhar as telas de dentro do sistema — é por isso que mudar uma
// etapa no Kanban aparece aqui sem ninguém recarregar nada.
export const dynamic = "force-dynamic";

// As quatro etapas, na ordem do funil. As classes trazem a cor de cada uma,
// definida no design.md e escrita no globals.css.
const ETAPAS = [
  { chave: "novo", numero: "numero-novo", barra: "barra-novo", etiqueta: "etapa-novo" },
  { chave: "em contato", numero: "numero-em-contato", barra: "barra-em-contato", etiqueta: "etapa-em-contato" },
  { chave: "proposta", numero: "numero-proposta", barra: "barra-proposta", etiqueta: "etapa-proposta" },
  { chave: "cliente", numero: "numero-cliente", barra: "barra-cliente", etiqueta: "etapa-cliente" },
];

const QUANTOS_RECENTES = 5;

export default async function PaginaInicial() {
  // Uma consulta serve as três áreas: a contagem, o gráfico e a lista dos
  // últimos. São poucos campos — se um dia forem milhares de contatos, vale
  // trocar a contagem por uma feita pelo banco.
  const { data, error } = await supabase
    .from("contatos")
    .select("id, nome, email, etapa, criado_em")
    .order("criado_em", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    return (
      <main className="pagina">
        <header className="cabecalho">
          <h1>Dashboard</h1>
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

  // A consulta já vem do mais novo para o mais velho, então os primeiros
  // da lista são os últimos cadastrados.
  const recentes = contatos.slice(0, QUANTOS_RECENTES);

  return (
    <main className="pagina">
      <header className="cabecalho">
        <h1>Dashboard</h1>
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
              <p className={`painel-numero ${etapa.numero}`}>
                {contagem[etapa.chave]}
              </p>
              <p className="painel-rotulo">{etapa.chave}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="secao-lista">
        <h2>Distribuição por etapa</h2>

        {total === 0 ? (
          <div className="aviso">
            Sem contatos ainda — o gráfico aparece quando o primeiro entrar.
          </div>
        ) : (
          <div className="grafico">
            {ETAPAS.map((etapa) => {
              const quantos = contagem[etapa.chave];
              const parte = Math.round((quantos / total) * 100);

              return (
                <div key={etapa.chave} className="grafico-linha">
                  <span className={`grafico-etapa ${etapa.etiqueta}`}>
                    {etapa.chave}
                  </span>

                  {/* A barra é uma div com largura em porcentagem: sem
                      biblioteca de gráfico, sem imagem, sem animação. */}
                  <div className="grafico-trilho">
                    <div
                      className={`grafico-barra ${etapa.barra}`}
                      style={{ width: `${parte}%` }}
                    />
                  </div>

                  {/* O número fica escrito ao lado: mesmo a barra menor
                      possível continua legível. */}
                  <span className="grafico-valor">
                    {quantos} · {parte}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="secao-lista">
        <h2>Últimos contatos cadastrados</h2>

        {recentes.length === 0 ? (
          <div className="aviso">
            Nenhum contato ainda. Cadastre o primeiro na área de Contatos.
          </div>
        ) : (
          <div className="lista-contatos">
            {recentes.map((contato) => {
              const etapa = ETAPAS.find((e) => e.chave === contato.etapa);

              return (
                <Link
                  key={contato.id}
                  href={`/contatos/${contato.id}`}
                  className="contato contato-link"
                >
                  <div className="contato-linha">
                    <div className="contato-info">
                      <p className="contato-nome">{contato.nome}</p>
                      <p className="contato-dados">
                        {contato.email || "Sem email"}
                      </p>
                    </div>
                    <div className="contato-direita">
                      <span className={`etiqueta ${etapa?.etiqueta ?? ""}`}>
                        {contato.etapa}
                      </span>
                      <span className="contato-tempo">
                        {tempoDesde(contato.criado_em)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
