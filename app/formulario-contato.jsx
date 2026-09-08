"use client";

import { useActionState, useEffect, useState } from "react";
import { salvarContato } from "./acoes";
import { validarContato, formatarTelefone } from "@/lib/validacao";

// "use client" marca este arquivo como código que também roda no navegador.
// É preciso porque o formulário reage ao usuário: valida enquanto digita,
// mostra erro embaixo de cada campo e se limpa quando dá certo.

const CAMPOS_VAZIOS = { nome: "", email: "", telefone: "" };
const TODOS_TOCADOS = { nome: true, email: true, telefone: true };

export default function FormularioContato({ aoSalvar }) {
  const [estado, acao, enviando] = useActionState(salvarContato, null);

  const [valores, setValores] = useState(CAMPOS_VAZIOS);
  const [erros, setErros] = useState({});
  // "Tocado" = o usuário já passou por esse campo. Só mostramos erro
  // depois disso, para não acusar erro em campo que nem foi preenchido.
  const [tocados, setTocados] = useState({});

  // Reage à resposta do servidor.
  useEffect(() => {
    if (estado?.ok) {
      setValores(CAMPOS_VAZIOS);
      setErros({});
      setTocados({});
      // Quem abriu o formulário numa janela (o quadro do funil) fecha ela aqui.
      aoSalvar?.();
    } else if (estado?.erros) {
      setErros(estado.erros);
      setTocados(TODOS_TOCADOS);
    }
  }, [estado]);

  function aoDigitar(campo, valor) {
    const novosValores = { ...valores, [campo]: valor };
    setValores(novosValores);

    // Revalida enquanto digita apenas se o campo já mostrou erro, para o
    // aviso sumir assim que for corrigido.
    if (tocados[campo]) {
      setErros(validarContato(novosValores));
    }
  }

  function aoSairDoCampo(campo) {
    // Ao sair do telefone, arruma o formato: 11988771234 vira (11) 98877-1234.
    const novosValores =
      campo === "telefone"
        ? { ...valores, telefone: formatarTelefone(valores.telefone) }
        : valores;

    setValores(novosValores);
    setTocados({ ...tocados, [campo]: true });
    setErros(validarContato(novosValores));
  }

  // Só mostra o erro de um campo depois que o usuário passou por ele.
  function erroDoCampo(campo) {
    return tocados[campo] ? erros[campo] : null;
  }

  return (
    // noValidate desliga as mensagens do navegador, para valerem as nossas.
    <form action={acao} className="formulario" noValidate>
      <Campo
        nome="nome"
        rotulo="Nome"
        tipo="text"
        maxLength={255}
        largo
        valor={valores.nome}
        erro={erroDoCampo("nome")}
        aoDigitar={aoDigitar}
        aoSair={aoSairDoCampo}
      />

      <Campo
        nome="email"
        rotulo="Email"
        tipo="email"
        maxLength={254}
        valor={valores.email}
        erro={erroDoCampo("email")}
        aoDigitar={aoDigitar}
        aoSair={aoSairDoCampo}
      />

      <Campo
        nome="telefone"
        rotulo="Telefone"
        tipo="tel"
        maxLength={20}
        valor={valores.telefone}
        erro={erroDoCampo("telefone")}
        aoDigitar={aoDigitar}
        aoSair={aoSairDoCampo}
      />

      {estado?.erroGeral && (
        <p className="erro campo-largo" role="alert">
          {estado.erroGeral}
        </p>
      )}

      <div className="campo-largo">
        <button type="submit" className="botao" disabled={enviando}>
          {enviando ? "Salvando..." : "Salvar contato"}
        </button>
      </div>
    </form>
  );
}

// Um campo do formulário: rótulo, caixa de texto e a mensagem de erro.
function Campo({
  nome,
  rotulo,
  tipo,
  maxLength,
  largo,
  valor,
  erro,
  aoDigitar,
  aoSair,
}) {
  const idDoErro = `erro-${nome}`;

  return (
    <div className={`campo${largo ? " campo-largo" : ""}`}>
      <label htmlFor={nome}>{rotulo}</label>
      <input
        id={nome}
        name={nome}
        type={tipo}
        maxLength={maxLength}
        autoComplete="off"
        value={valor}
        onChange={(evento) => aoDigitar(nome, evento.target.value)}
        onBlur={() => aoSair(nome)}
        aria-invalid={erro ? "true" : "false"}
        aria-describedby={erro ? idDoErro : undefined}
      />
      {erro && (
        <p id={idDoErro} className="erro-campo" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}
