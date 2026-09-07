import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const [nome, novaEtapa] = process.argv.slice(2);

const { data: antes } = await supabase
  .from("contatos")
  .select("id, nome, etapa")
  .ilike("nome", `%${nome}%`)
  .maybeSingle();

if (!antes) {
  console.log("Contato não encontrado:", nome);
  process.exit(1);
}

await supabase.from("contatos").update({ etapa: novaEtapa }).eq("id", antes.id);

const { data: todos } = await supabase.from("contatos").select("etapa");
const contagem = {};
for (const c of todos) contagem[c.etapa] = (contagem[c.etapa] ?? 0) + 1;

console.log(`${antes.nome}: "${antes.etapa}" -> "${novaEtapa}"`);
console.log("Contagem no banco agora:", contagem, "| total:", todos.length);
