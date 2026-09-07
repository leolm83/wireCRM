"use server";

import { revalidatePath } from "next/cache";
import { exigirAdmin } from "@/lib/sessao";
import { aprovarUsuario } from "@/lib/usuarios";

export async function aprovar(estadoAnterior, dadosDoFormulario) {
  // Só administrador passa daqui. Quem não for, vai para a tela inicial.
  await exigirAdmin();

  const id = Number(dadosDoFormulario.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return { erro: "Usuário inválido." };
  }

  const deuCerto = await aprovarUsuario(id);
  if (!deuCerto) {
    return { erro: "Não consegui aprovar. Tente de novo." };
  }

  revalidatePath("/usuarios");

  return { ok: true };
}
