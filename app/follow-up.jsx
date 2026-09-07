"use client";

import { useActionState, useEffect, useState } from "react";
import { gerarFollowUp } from "./acoes-followup";

export default function FollowUp({ contatoId }) {
  const [estado, acao, escrevendo] = useActionState(gerarFollowUp, null);
  const [copia, setCopia] = useState(null);

  // O aviso de "Copiado" some sozinho depois de um instante.
  useEffect(() => {
    if (!copia) return;
    const relogio = setTimeout(() => setCopia(null), 2500);
    return () => clearTimeout(relogio);
  }, [copia]);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(estado.mensagem);
      setCopia("ok");
    } catch {
      setCopia("falhou");
    }
  }

  return (
    <div className="followup">
      <div className="followup-topo">
        <p className="rotulo-anotacao">Follow-up</p>
        <form action={acao}>
          <input type="hidden" name="contatoId" value={contatoId} />
          <button
            type="submit"
            className="botao botao-pequeno"
            disabled={escrevendo}
          >
            {escrevendo ? "Escrevendo..." : "Gerar follow-up"}
          </button>
        </form>
      </div>

      {escrevendo && (
        <p className="followup-escrevendo" role="status">
          A IA está escrevendo a mensagem...
        </p>
      )}

      {!escrevendo && estado?.erro && (
        <p className="erro-campo" role="alert">
          {estado.erro}
        </p>
      )}

      {!escrevendo && estado?.ok && (
        <div className="followup-resultado">
          <p className="followup-mensagem">{estado.mensagem}</p>
          <div className="followup-acoes">
            <button type="button" className="botao-texto" onClick={copiar}>
              Copiar mensagem
            </button>
            {copia === "ok" && (
              <span className="followup-copiado" role="status">
                Copiado
              </span>
            )}
            {copia === "falhou" && (
              <span className="erro-campo" role="alert">
                O navegador não deixou copiar. Selecione e copie à mão.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
