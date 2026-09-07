import { supabase } from "./supabase";

// Consultas à tabela de usuários. Tudo aqui roda só no servidor.

// Campos que podem circular pelo sistema. A senha embaralhada NÃO está
// aqui de propósito: só o login precisa dela, e ela não deve viajar junto
// do usuário por telas e componentes.
const CAMPOS_PUBLICOS = "id, usuario, papel, status, criado_em";

// Única função que traz a senha embaralhada, porque é a única que
// precisa conferi-la.
export async function buscarUsuarioPorNome(usuario) {
  const { data, error } = await supabase
    .from("usuarios")
    .select(`${CAMPOS_PUBLICOS}, senha_hash`)
    .eq("usuario", usuario)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar usuário:", error);
    return null;
  }
  return data;
}

// Usada a cada visita para saber quem está logado. O resultado passeia
// por várias telas, então vai sem a senha embaralhada.
export async function buscarUsuarioPorId(id) {
  const { data, error } = await supabase
    .from("usuarios")
    .select(CAMPOS_PUBLICOS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar usuário:", error);
    return null;
  }
  return data;
}

// Todo cadastro novo nasce comum e pendente — os padrões estão no banco.
export async function criarUsuario(usuario, senhaHash) {
  const { error } = await supabase
    .from("usuarios")
    .insert({ usuario, senha_hash: senhaHash });

  if (error) {
    // 23505 é o código do Postgres para "esse valor já existe".
    if (error.code === "23505") {
      return { ok: false, jaExiste: true };
    }
    console.error("Erro ao criar usuário:", error);
    return { ok: false };
  }
  return { ok: true };
}

export async function listarUsuarios() {
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, usuario, papel, status, criado_em")
    .order("criado_em", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    console.error("Erro ao listar usuários:", error);
    return null;
  }
  return data;
}

export async function aprovarUsuario(id) {
  const { error } = await supabase
    .from("usuarios")
    .update({ status: "aprovado" })
    .eq("id", id);

  if (error) {
    console.error("Erro ao aprovar usuário:", error);
    return false;
  }
  return true;
}
