"use client";

import { useActionState } from "react";
import { aprovar } from "../../acoes-usuarios";

export default function BotaoAprovar({ id }) {
  const [estado, acao, aprovando] = useActionState(aprovar, null);

  return (
    <form action={acao} className="form-aprovar">
      <input type="hidden" name="id" value={id} />

      {estado?.erro && (
        <span className="erro-campo" role="alert">
          {estado.erro}
        </span>
      )}

      <button type="submit" className="botao botao-pequeno" disabled={aprovando}>
        {aprovando ? "Aprovando..." : "Aprovar"}
      </button>
    </form>
  );
}
