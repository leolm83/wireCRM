"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { atualizarAnotacao, excluirAnotacao } from "./acoes";

// Uma anotação da lista, com os botões de editar e excluir.
// Roda no navegador porque precisa alternar entre ler e editar, e
// abrir a janela de confirmação.

export default function AnotacaoItem({ anotacao, ehAdmin }) {
  const [editando, setEditando] = useState(false);
  const janelaConfirmacao = useRef(null);

  const [edicao, acaoEditar, salvando] = useActionState(atualizarAnotacao, null);
  const [exclusao, acaoExcluir, excluindo] = useActionState(
    excluirAnotacao,
    null
  );

  // Salvou a edição? Volta para o modo de leitura.
  useEffect(() => {
    if (edicao?.ok) {
      setEditando(false);
    }
  }, [edicao]);

  // Excluiu? Fecha a janela de confirmação.
  useEffect(() => {
    if (exclusao?.ok) {
      janelaConfirmacao.current?.close();
    }
  }, [exclusao]);

  return (
    <li className="anotacao">
      <div className="anotacao-topo">
        <p className="anotacao-data">{anotacao.data}</p>

        {/* Editar e excluir só existem para quem pode alterar. */}
        {ehAdmin && !editando && (
          <div className="anotacao-acoes">
            <button
              type="button"
              className="botao-texto discreto"
              onClick={() => setEditando(true)}
            >
              Editar
            </button>
            <button
              type="button"
              className="botao-texto discreto"
              onClick={() => janelaConfirmacao.current?.showModal()}
            >
              Excluir
            </button>
          </div>
        )}
      </div>

      {editando ? (
        <form action={acaoEditar} className="formulario-edicao">
          <input type="hidden" name="id" value={anotacao.id} />
          <textarea
            name="texto"
            rows={3}
            maxLength={2000}
            defaultValue={anotacao.texto}
            aria-label="Editar anotação"
          />

          {edicao?.erro && (
            <p className="erro-campo" role="alert">
              {edicao.erro}
            </p>
          )}

          <div className="acoes-edicao">
            <button
              type="submit"
              className="botao botao-pequeno"
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              className="botao-texto"
              onClick={() => setEditando(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <p className="anotacao-texto">{anotacao.texto}</p>
      )}

      {/* <dialog> é a janela do próprio navegador: fecha com Esc e prende
          o foco dentro dela sem precisarmos programar nada disso. */}
      <dialog ref={janelaConfirmacao} className="confirmacao">
        <h3>Excluir anotação?</h3>
        <p className="apoio">
          A anotação de {anotacao.data} será apagada. Não dá para desfazer.
        </p>

        {exclusao?.erro && (
          <p className="erro-campo" role="alert">
            {exclusao.erro}
          </p>
        )}

        <form action={acaoExcluir}>
          <input type="hidden" name="id" value={anotacao.id} />
          <div className="confirmacao-acoes">
            <button
              type="button"
              className="botao-secundario"
              onClick={() => janelaConfirmacao.current?.close()}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="botao botao-perigo"
              disabled={excluindo}
            >
              {excluindo ? "Excluindo..." : "Excluir anotação"}
            </button>
          </div>
        </form>
      </dialog>
    </li>
  );
}
