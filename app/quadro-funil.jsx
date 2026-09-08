"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { mudarEtapa } from "./acoes";
import FormularioContato from "./formulario-contato";

// O quadro do funil: uma coluna por etapa, um cartão por contato.
//
// Roda no navegador porque precisa de três coisas que só existem lá: o
// arrastar do cartão, o contador que muda na hora e a janela do cadastro.
// O arrastar é o do próprio HTML (draggable / onDrop) — não entrou nenhuma
// biblioteca para isso.

const ETAPAS = [
  { chave: "novo", classe: "etapa-novo" },
  { chave: "em contato", classe: "etapa-em-contato" },
  { chave: "proposta", classe: "etapa-proposta" },
  { chave: "cliente", classe: "etapa-cliente" },
];

export default function QuadroFunil({ contatos, ehAdmin }) {
  // Os cartões vivem aqui para o quadro se redesenhar na hora do arrasto,
  // sem esperar a volta do servidor.
  const [cartoes, setCartoes] = useState(contatos);

  // Quando o servidor manda dados novos — um contato cadastrado, uma etapa
  // gravada — o quadro aceita a versão dele. O servidor é quem tem razão.
  useEffect(() => {
    setCartoes(contatos);
  }, [contatos]);

  const [salvando, iniciarTransicao] = useTransition();
  const [erro, setErro] = useState(null);

  // Só para o desenho: qual cartão está na mão e sobre qual coluna ele está.
  const [arrastando, setArrastando] = useState(null);
  const [colunaAlvo, setColunaAlvo] = useState(null);

  const janelaCadastro = useRef(null);

  function aoComecarArrasto(evento, id) {
    // O id viaja junto com o arrasto. Assim o solto não depende do estado
    // do React ter atualizado a tempo.
    evento.dataTransfer.setData("text/plain", String(id));
    evento.dataTransfer.effectAllowed = "move";
    setErro(null);
    setArrastando(id);
  }

  function aoPassarPorCima(evento, etapa) {
    // Sem este preventDefault o navegador não deixa soltar nada aqui.
    evento.preventDefault();
    evento.dataTransfer.dropEffect = "move";
    setColunaAlvo(etapa);
  }

  function aoSoltar(evento, etapa) {
    evento.preventDefault();
    setColunaAlvo(null);
    setArrastando(null);

    const id = Number(evento.dataTransfer.getData("text/plain"));
    if (!Number.isInteger(id)) return;

    moverPara(id, etapa);
  }

  function moverPara(id, etapa) {
    const cartao = cartoes.find((c) => c.id === id);
    // Soltou na mesma coluna de onde saiu: não há nada para gravar.
    if (!cartao || cartao.etapa === etapa) return;

    const anterior = cartao.etapa;

    setCartoes((atuais) =>
      atuais.map((c) => (c.id === id ? { ...c, etapa } : c))
    );

    iniciarTransicao(async () => {
      const resultado = await mudarEtapa(id, etapa);

      if (resultado?.erro) {
        // Deu errado: devolve o cartão para a coluna de origem, para a tela
        // não mentir sobre o que está salvo.
        setCartoes((atuais) =>
          atuais.map((c) => (c.id === id ? { ...c, etapa: anterior } : c))
        );
        setErro(resultado.erro);
      }
    });
  }

  return (
    <main className="pagina">
      <header className="cabecalho">
        <div className="cabecalho-topo">
          <h1>Funil</h1>
          <button
            type="button"
            className="botao"
            onClick={() => janelaCadastro.current?.showModal()}
          >
            Novo contato
          </button>
        </div>
        <p className="apoio">Em que pé está cada conversa.</p>
      </header>

      {erro && (
        <p className="erro quadro-erro" role="alert">
          {erro}
        </p>
      )}

      <div className={`quadro${salvando ? " salvando" : ""}`}>
        {ETAPAS.map((etapa) => {
          const daEtapa = cartoes.filter((c) => c.etapa === etapa.chave);
          const alvo = colunaAlvo === etapa.chave;

          return (
            <section
              key={etapa.chave}
              className={`coluna${alvo ? " alvo" : ""}`}
              onDragOver={ehAdmin ? (e) => aoPassarPorCima(e, etapa.chave) : undefined}
              onDragLeave={ehAdmin ? () => setColunaAlvo(null) : undefined}
              onDrop={ehAdmin ? (e) => aoSoltar(e, etapa.chave) : undefined}
            >
              <div className="coluna-topo">
                <span className={`coluna-nome ${etapa.classe}`}>
                  {etapa.chave}
                </span>
                <span className="coluna-contador">{daEtapa.length}</span>
              </div>

              <div className="coluna-corpo">
                {daEtapa.length === 0 ? (
                  <p className="coluna-vazia">Nenhum contato aqui.</p>
                ) : (
                  daEtapa.map((cartao) => (
                    <article
                      key={cartao.id}
                      className={`cartao-contato${
                        arrastando === cartao.id ? " arrastando" : ""
                      }`}
                      draggable={ehAdmin}
                      onDragStart={
                        ehAdmin ? (e) => aoComecarArrasto(e, cartao.id) : undefined
                      }
                      onDragEnd={() => {
                        setArrastando(null);
                        setColunaAlvo(null);
                      }}
                    >
                      <p className="cartao-nome">{cartao.nome}</p>
                      <p className="cartao-email">{cartao.email}</p>
                      <p className="cartao-tempo">{cartao.desde}</p>
                    </article>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* <dialog> é a janela do próprio navegador: fecha com Esc e prende o
          foco dentro dela sem precisarmos programar nada disso. */}
      <dialog ref={janelaCadastro} className="confirmacao janela-contato">
        <h3>Novo contato</h3>
        <p className="apoio">Ele entra no funil na etapa novo.</p>

        {/* O mesmo formulário da tela de Contatos. Aqui ele avisa quando
            grava, para a janela poder se fechar sozinha. */}
        <FormularioContato aoSalvar={() => janelaCadastro.current?.close()} />

        <div className="confirmacao-acoes">
          <button
            type="button"
            className="botao-secundario"
            onClick={() => janelaCadastro.current?.close()}
          >
            Fechar
          </button>
        </div>
      </dialog>
    </main>
  );
}
