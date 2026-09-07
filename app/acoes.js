"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { exigirSessao, ehAdmin } from "@/lib/sessao";
import {
  validarContato,
  formatarTelefone,
  validarTextoDeAnotacao,
} from "@/lib/validacao";

// "use server" no topo do arquivo marca estas funções como código que roda
// SÓ NO SERVIDOR. O formulário no navegador chama a função; o Next.js leva
// os dados até aqui. A chave do banco nunca precisa sair do servidor.

// As quatro etapas do funil, como definidas no prd.md. O banco também
// recusa qualquer outra, mas conferir aqui dá uma mensagem melhor.
const ETAPAS = ["novo", "em contato", "proposta", "cliente"];

const SEM_PERMISSAO = "Só o administrador pode alterar isto.";

// Alterar o que já existe é coisa de administrador. Usuário comum lê e
// cria, mas não mexe no que está gravado.
async function exigirPermissaoDeEdicao() {
  await exigirSessao();
  return ehAdmin();
}

// Move um contato de etapa. Chamada direto pelo seletor, sem formulário.
export async function mudarEtapa(contatoId, novaEtapa) {
  if (!(await exigirPermissaoDeEdicao())) {
    return { erro: SEM_PERMISSAO };
  }

  const id = Number(contatoId);
  if (!Number.isInteger(id) || id <= 0) {
    return { erro: "Contato inválido." };
  }
  if (!ETAPAS.includes(novaEtapa)) {
    return { erro: "Etapa inválida." };
  }

  const { error } = await supabase
    .from("contatos")
    .update({ etapa: novaEtapa })
    .eq("id", id);

  if (error) {
    console.error("Erro ao mudar etapa:", error);
    return { erro: "Não consegui mudar a etapa. Tente de novo." };
  }

  revalidatePath("/", "layout");

  return { ok: true };
}

export async function salvarContato(estadoAnterior, dadosDoFormulario) {
  await exigirSessao();

  const valores = {
    nome: dadosDoFormulario.get("nome") ?? "",
    email: dadosDoFormulario.get("email") ?? "",
    telefone: dadosDoFormulario.get("telefone") ?? "",
  };

  // Esta é a validação que vale. A do navegador é só para avisar rápido —
  // ela pode ser contornada, esta não.
  const erros = validarContato(valores);
  if (Object.keys(erros).length > 0) {
    return { ok: false, erros };
  }

  // Guarda tudo padronizado: email sempre minúsculo, telefone sempre
  // no formato (11) 98877-1234, independente de como foi digitado.
  const { error } = await supabase.from("contatos").insert({
    nome: valores.nome.trim(),
    email: valores.email.trim().toLowerCase(),
    telefone: formatarTelefone(valores.telefone),
  });

  if (error) {
    console.error("Erro ao salvar contato:", error);
    return {
      ok: false,
      erroGeral: "Não consegui salvar no banco. Tente de novo.",
    };
  }

  // Avisa o Next.js que os dados da página mudaram, para ele redesenhar
  // a lista com o contato novo — sem recarregar a página inteira.
  // "layout" faz o Next redesenhar todas as telas de dentro do sistema —
  // é o que mantém o painel e a lista de contatos em sincronia.
  revalidatePath("/", "layout");

  return { ok: true };
}

// Guarda uma anotação ligada a um contato específico.
export async function salvarAnotacao(estadoAnterior, dadosDoFormulario) {
  if (!(await exigirPermissaoDeEdicao())) {
    return { ok: false, erro: SEM_PERMISSAO };
  }

  const contatoId = Number(dadosDoFormulario.get("contatoId"));
  const texto = String(dadosDoFormulario.get("texto") ?? "").trim();

  if (!Number.isInteger(contatoId) || contatoId <= 0) {
    return { ok: false, erro: "Contato inválido." };
  }

  const erroTexto = validarTextoDeAnotacao(texto);
  if (erroTexto) {
    return { ok: false, erro: erroTexto };
  }

  const { error } = await supabase.from("anotacoes").insert({
    contato_id: contatoId,
    texto,
  });

  if (error) {
    console.error("Erro ao salvar anotação:", error);
    return { ok: false, erro: "Não consegui salvar a anotação. Tente de novo." };
  }

  // "layout" faz o Next redesenhar todas as telas de dentro do sistema —
  // é o que mantém o painel e a lista de contatos em sincronia.
  revalidatePath("/", "layout");

  return { ok: true };
}

// Troca o texto de uma anotação que já existe.
export async function atualizarAnotacao(estadoAnterior, dadosDoFormulario) {
  if (!(await exigirPermissaoDeEdicao())) {
    return { ok: false, erro: SEM_PERMISSAO };
  }

  const id = Number(dadosDoFormulario.get("id"));
  const texto = String(dadosDoFormulario.get("texto") ?? "").trim();

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, erro: "Anotação inválida." };
  }

  const erroTexto = validarTextoDeAnotacao(texto);
  if (erroTexto) {
    // Mantém a mensagem de campo vazio que já existia nesta tela.
    return {
      ok: false,
      erro: texto ? erroTexto : "A anotação não pode ficar vazia.",
    };
  }

  const { error } = await supabase
    .from("anotacoes")
    .update({ texto })
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar anotação:", error);
    return { ok: false, erro: "Não consegui salvar a alteração. Tente de novo." };
  }

  // "layout" faz o Next redesenhar todas as telas de dentro do sistema —
  // é o que mantém o painel e a lista de contatos em sincronia.
  revalidatePath("/", "layout");

  return { ok: true };
}

// Apaga uma anotação de vez. Quem chama já confirmou com o usuário.
export async function excluirAnotacao(estadoAnterior, dadosDoFormulario) {
  if (!(await exigirPermissaoDeEdicao())) {
    return { ok: false, erro: SEM_PERMISSAO };
  }

  const id = Number(dadosDoFormulario.get("id"));

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, erro: "Anotação inválida." };
  }

  const { error } = await supabase.from("anotacoes").delete().eq("id", id);

  if (error) {
    console.error("Erro ao excluir anotação:", error);
    return { ok: false, erro: "Não consegui excluir. Tente de novo." };
  }

  // "layout" faz o Next redesenhar todas as telas de dentro do sistema —
  // é o que mantém o painel e a lista de contatos em sincronia.
  revalidatePath("/", "layout");

  return { ok: true };
}
