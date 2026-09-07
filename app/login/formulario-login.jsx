"use client";

import { useActionState, useState } from "react";
import { entrar } from "../acoes-login";

export default function FormularioLogin() {
  const [estado, acao, entrando] = useActionState(entrar, null);

  // Os campos são guardados aqui, no componente. Sem isso, o React limpa
  // o formulário sozinho quando a ação do servidor termina — inclusive
  // quando ela termina em erro, e aí você teria que redigitar tudo.
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");

  // Deixa conferir o que foi digitado, para achar o erro de digitação.
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  return (
    <form action={acao} className="formulario-login">
      <div className="campo">
        <label htmlFor="usuario">Usuário</label>
        <input
          id="usuario"
          name="usuario"
          type="text"
          autoComplete="username"
          autoFocus
          value={usuario}
          onChange={(evento) => setUsuario(evento.target.value)}
        />
      </div>

      <div className="campo">
        <label htmlFor="senha">Senha</label>
        <div className="campo-com-botao">
          <input
            id="senha"
            name="senha"
            // Trocar para "text" é o que revela a senha na tela.
            type={senhaVisivel ? "text" : "password"}
            autoComplete="current-password"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
          />
          {/* type="button" é obrigatório: sem isso, o botão enviaria o
              formulário em vez de só alternar a visibilidade. */}
          <button
            type="button"
            className="botao-mostrar"
            onClick={() => setSenhaVisivel(!senhaVisivel)}
            aria-label={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
          >
            {senhaVisivel ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>

      {estado?.erro && (
        <p className="erro" role="alert">
          {estado.erro}
        </p>
      )}

      <button type="submit" className="botao" disabled={entrando}>
        {entrando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
