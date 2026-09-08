"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { salvarAnotacao } from "./acoes";
import AnotacaoItem from "./anotacao-item";
import FollowUp from "./follow-up";
import SeletorEtapa from "./seletor-etapa";

// Um contato da lista. Roda no navegador porque precisa abrir e fechar
// as anotações sem recarregar a página.

export default function ContatoItem({ contato, ehAdmin }) {
  const [aberto, setAberto] = useState(false);
  const [estado, acao, enviando] = useActionState(salvarAnotacao, null);
  const campoTexto = useRef(null);

  const anotacoes = contato.anotacoes ?? [];

  // Salvou? Limpa a caixa de texto para a próxima anotação.
  useEffect(() => {
    if (estado?.ok && campoTexto.current) {
      campoTexto.current.value = "";
    }
  }, [estado]);

  return (
    <article className="contato">
      <div className="contato-linha">
        <div className="contato-info">
          <p className="contato-nome">{contato.nome}</p>
          <p className="contato-dados">{contato.dados}</p>
        </div>

        <div className="contato-direita">
          <SeletorEtapa contato={contato} ehAdmin={ehAdmin} />
          <button
            type="button"
            className="botao-texto"
            onClick={() => setAberto(!aberto)}
            aria-expanded={aberto}
          >
            {aberto ? (
              "Fechar"
            ) : (
              <>
                Anotações <span className="contador">({anotacoes.length})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {aberto && (
        <div className="anotacoes">
          {anotacoes.length === 0 ? (
            <p className="apoio sem-anotacoes">
              Nenhuma anotação ainda para {contato.nome}.
            </p>
          ) : (
            <ul className="lista-anotacoes">
              {anotacoes.map((anotacao) => (
                <AnotacaoItem
                  key={anotacao.id}
                  anotacao={anotacao}
                  ehAdmin={ehAdmin}
                />
              ))}
            </ul>
          )}

          {/* Escrever anotação é do administrador. */}
          {ehAdmin && (
          <form action={acao} className="formulario-anotacao">
            {/* Diz ao servidor de qual contato é esta anotação. */}
            <input type="hidden" name="contatoId" value={contato.id} />

            <label htmlFor={`anotacao-${contato.id}`} className="rotulo-anotacao">
              Nova anotação
            </label>
            <textarea
              ref={campoTexto}
              id={`anotacao-${contato.id}`}
              name="texto"
              rows={3}
              maxLength={2000}
              placeholder="O que foi conversado?"
            />

            {estado?.erro && (
              <p className="erro-campo" role="alert">
                {estado.erro}
              </p>
            )}

            <div>
              <button type="submit" className="botao" disabled={enviando}>
                {enviando ? "Salvando..." : "Adicionar anotação"}
              </button>
            </div>
          </form>
          )}

          {/* Follow-up é área só do administrador. */}
          {ehAdmin && <FollowUp contatoId={contato.id} />}
        </div>
      )}
    </article>
  );
}
