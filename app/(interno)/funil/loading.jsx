// O Next.js mostra este arquivo sozinho enquanto a página ao lado busca os
// contatos no banco. Não precisa de estado nem de código no navegador: basta
// existir com este nome, na mesma pasta da página.

const ETAPAS = [
  { chave: "novo", classe: "etapa-novo" },
  { chave: "em contato", classe: "etapa-em-contato" },
  { chave: "proposta", classe: "etapa-proposta" },
  { chave: "cliente", classe: "etapa-cliente" },
];

export default function CarregandoFunil() {
  return (
    <main className="pagina">
      <header className="cabecalho">
        <div className="cabecalho-topo">
          <h1>Funil</h1>
        </div>
        <p className="apoio">Em que pé está cada conversa.</p>
      </header>

      {/* As colunas já aparecem com o nome da etapa: a tela toma a forma
          final antes de os dados chegarem, em vez de saltar depois. */}
      <div className="quadro" aria-busy="true">
        {ETAPAS.map((etapa) => (
          <section key={etapa.chave} className="coluna">
            <div className="coluna-topo">
              <span className={`coluna-nome ${etapa.classe}`}>{etapa.chave}</span>
            </div>
            <div className="coluna-corpo">
              <p className="coluna-carregando" role="status">
                Carregando...
              </p>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
