"use server";

import { redirect } from "next/navigation";
import { gerarHashDeSenha, senhaConfere } from "@/lib/senha";
import { criarSessao, encerrarSessao } from "@/lib/sessao";
import { buscarUsuarioPorNome, criarUsuario } from "@/lib/usuarios";
import {
  validarNomeDeUsuario,
  validarSenhaNova,
  senhaCabeNoLimite,
} from "@/lib/validacao";

// Hash descartável, usado só para gastar o mesmo tempo quando o usuário
// não existe. Sem isso, a resposta viria mais rápido nesse caso e o tempo
// denunciaria quais nomes de usuário existem.
const HASH_DE_ENFEITE =
  "00000000000000000000000000000000:" + "0".repeat(128);

export async function entrar(estadoAnterior, dadosDoFormulario) {
  const nome = String(dadosDoFormulario.get("usuario") ?? "").trim();
  const senha = String(dadosDoFormulario.get("senha") ?? "");

  // Recusa antes de embaralhar: um texto gigante aqui só serviria para
  // fazer o servidor gastar tempo à toa. A mensagem é a mesma das outras
  // tentativas erradas, para não dar pista de nada.
  if (!senhaCabeNoLimite(senha)) {
    return { erro: "Usuário ou senha inválidos." };
  }

  const usuario = await buscarUsuarioPorNome(nome);

  // A conferência roda sempre, mesmo sem usuário encontrado.
  const confere = await senhaConfere(
    senha,
    usuario ? usuario.senha_hash : HASH_DE_ENFEITE
  );

  if (!usuario || !confere) {
    // Mensagem única: não dizemos qual dos dois está errado.
    return { erro: "Usuário ou senha inválidos." };
  }

  if (usuario.status !== "aprovado") {
    return {
      erro: "Seu cadastro ainda não foi aprovado pelo administrador.",
    };
  }

  await criarSessao(usuario.id);
  redirect("/");
}

export async function cadastrar(estadoAnterior, dadosDoFormulario) {
  const nome = String(dadosDoFormulario.get("usuario") ?? "").trim();
  const senha = String(dadosDoFormulario.get("senha") ?? "");
  const confirmacao = String(dadosDoFormulario.get("confirmacao") ?? "");

  const erros = {};

  const erroUsuario = validarNomeDeUsuario(nome);
  if (erroUsuario) erros.usuario = erroUsuario;

  const erroSenha = validarSenhaNova(senha);
  if (erroSenha) erros.senha = erroSenha;

  if (!erros.senha && senha !== confirmacao) {
    erros.confirmacao = "As senhas não são iguais.";
  }

  if (Object.keys(erros).length > 0) {
    return { erros };
  }

  const hash = await gerarHashDeSenha(senha);
  const resultado = await criarUsuario(nome, hash);

  if (!resultado.ok) {
    if (resultado.jaExiste) {
      return { erros: { usuario: "Esse nome de usuário já está em uso." } };
    }
    return { erroGeral: "Não consegui criar o cadastro. Tente de novo." };
  }

  // Cadastro criado como pendente: ninguém entra sem o admin aprovar.
  return { ok: true };
}

export async function sair() {
  await encerrarSessao();
  redirect("/login");
}
