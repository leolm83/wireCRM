"use client";

import { useRef, useState, useTransition } from "react";
import { mudarEtapa } from "./acoes";

// A etiqueta de etapa é também o controle que muda a etapa: clicar nela
// abre as opções. A informação e a ação ficam no mesmo lugar, e o <select>
// do próprio navegador já vem com teclado, leitor de tela e o seletor
// nativo do celular — nada disso precisou ser programado.

const ETAPAS = ["novo", "em contato", "proposta", "cliente"];

const CLASSE_DA_ETAPA = {
  novo: "etapa-novo",
  "em contato": "etapa-em-contato",
  proposta: "etapa-proposta",
  cliente: "etapa-cliente",
};

export default function SeletorEtapa({ contato, ehAdmin }) {
  const [salvando, iniciarTransicao] = useTransition();
  const [erro, setErro] = useState(null);

  // Mostra a cor certa já na escolha, sem esperar a volta do servidor.
  const [etapaNaTela, setEtapaNaTela] = useState(contato.etapa);
  // Guarda a última etapa confirmada, para voltar atrás se der erro.
  const confirmada = useRef(contato.etapa);
  const seletor = useRef(null);

  function aoEscolher(evento) {
    const nova = evento.target.value;

    setErro(null);
    setEtapaNaTela(nova);

    iniciarTransicao(async () => {
      const resultado = await mudarEtapa(contato.id, nova);

      if (resultado?.erro) {
        // Deu errado: desfaz na tela para não mentir sobre o que está salvo.
        setErro(resultado.erro);
        setEtapaNaTela(confirmada.current);
        if (seletor.current) seletor.current.value = confirmada.current;
        return;
      }

      confirmada.current = nova;
    });
  }

  // Quem não pode editar vê a etapa como etiqueta, sem controle nenhum.
  if (!ehAdmin) {
    return (
      <span className={`etiqueta ${CLASSE_DA_ETAPA[contato.etapa] ?? ""}`}>
        {contato.etapa}
      </span>
    );
  }

  return (
    <div className="etapa-controle">
      <div
        className={`seletor-etapa ${CLASSE_DA_ETAPA[etapaNaTela] ?? ""}${
          salvando ? " salvando" : ""
        }`}
      >
        <select
          ref={seletor}
          defaultValue={contato.etapa}
          onChange={aoEscolher}
          disabled={salvando}
          aria-label={`Etapa do funil de ${contato.nome}`}
        >
          {ETAPAS.map((etapa) => (
            <option key={etapa} value={etapa}>
              {etapa}
            </option>
          ))}
        </select>
      </div>

      {erro && (
        <p className="erro-campo" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}
