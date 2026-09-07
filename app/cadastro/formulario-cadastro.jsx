"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { cadastrar } from "../acoes-login";

export default function FormularioCadastro() {
  const [estado, acao, enviando] = useActionState(cadastrar, null);

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  // Deu certo: some o formulário e explica o que acontece agora.
  if (estado?.ok) {
    return (
      <div className="cadastro-enviado">
        <p className="cadastro-enviado-titulo">Cadastro enviado.</p>
        <p className="apoio">
          Seu acesso fica pendente até o administrador aprovar. Assim que
          isso acontecer, você já consegue entrar com o usuário e a senha
          que escolheu.
        </p>
        <Link href="/login" className="botao botao-link">
          Ir para o login
        </Link>
      </div>
    );
  }

  const erros = estado?.erros ?? {};

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
          maxLength={50}
          value={usuario}
          onChange={(evento) => setUsuario(evento.target.value)}
          aria-invalid={erros.usuario ? "true" : "false"}
        />
        {erros.usuario && (
          <p className="erro-campo" role="alert">
            {erros.usuario}
          </p>
        )}
      </div>

      <div className="campo">
        <label htmlFor="senha">Senha</label>
        <div className="campo-com-botao">
          <input
            id="senha"
            name="senha"
            type={senhaVisivel ? "text" : "password"}
            autoComplete="new-password"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            aria-invalid={erros.senha ? "true" : "false"}
          />
          <button
            type="button"
            className="botao-mostrar"
            onClick={() => setSenhaVisivel(!senhaVisivel)}
            aria-label={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
          >
            {senhaVisivel ? "Ocultar" : "Mostrar"}
          </button>
        </div>
        {erros.senha && (
          <p className="erro-campo" role="alert">
            {erros.senha}
          </p>
        )}
      </div>

      <div className="campo">
        <label htmlFor="confirmacao">Repita a senha</label>
        <input
          id="confirmacao"
          name="confirmacao"
          type={senhaVisivel ? "text" : "password"}
          autoComplete="new-password"
          value={confirmacao}
          onChange={(evento) => setConfirmacao(evento.target.value)}
          aria-invalid={erros.confirmacao ? "true" : "false"}
        />
        {erros.confirmacao && (
          <p className="erro-campo" role="alert">
            {erros.confirmacao}
          </p>
        )}
      </div>

      {estado?.erroGeral && (
        <p className="erro" role="alert">
          {estado.erroGeral}
        </p>
      )}

      <button type="submit" className="botao" disabled={enviando}>
        {enviando ? "Enviando..." : "Criar cadastro"}
      </button>
    </form>
  );
}
