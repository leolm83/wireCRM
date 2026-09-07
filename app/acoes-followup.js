"use server";

import { supabase } from "@/lib/supabase";
import { exigirSessao, ehAdmin } from "@/lib/sessao";
import { escreverFollowUp } from "@/lib/followup";

const FORMATO_DE_DATA = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

export async function gerarFollowUp(estadoAnterior, dadosDoFormulario) {
  await exigirSessao();

  // Follow-up é só do administrador: além de ler todo o histórico do
  // contato, cada geração consome créditos da conta da IA.
  if (!(await ehAdmin())) {
    return { ok: false, erro: "Só o administrador pode gerar follow-ups." };
  }

  const contatoId = Number(dadosDoFormulario.get("contatoId"));
  if (!Number.isInteger(contatoId) || contatoId <= 0) {
    return { ok: false, erro: "Contato inválido." };
  }

  // Os dados vêm do banco, não da tela: o que chega do navegador pode
  // ter sido alterado, e é isso que a IA vai ler.
  const { data: contato, error } = await supabase
    .from("contatos")
    .select("nome, etapa, anotacoes(texto, criado_em)")
    .eq("id", contatoId)
    .maybeSingle();

  if (error || !contato) {
    return { ok: false, erro: "Não encontrei esse contato." };
  }

  const anotacoes = [...(contato.anotacoes ?? [])]
    .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))
    .map((anotacao) => ({
      texto: anotacao.texto,
      data: FORMATO_DE_DATA.format(new Date(anotacao.criado_em)),
    }));

  return await escreverFollowUp(contato, anotacoes);
}
