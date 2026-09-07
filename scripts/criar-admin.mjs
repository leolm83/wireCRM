import { createClient } from "@supabase/supabase-js";

// Leva o acesso que hoje está no .env.local para a tabela de usuários,
// já como administrador aprovado. A senha não muda: o que é copiado é o
// mesmo embaralhado que já estava lá.
//
// Rodar uma vez só: npm run criar-admin

const usuario = process.env.CRM_USUARIO;
const senhaHash = process.env.CRM_SENHA_HASH;

if (!usuario || !senhaHash) {
  console.error(
    "\nFaltam CRM_USUARIO ou CRM_SENHA_HASH no .env.local.\n"
  );
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const { data: jaExiste } = await supabase
  .from("usuarios")
  .select("id, usuario, papel, status")
  .eq("usuario", usuario)
  .maybeSingle();

if (jaExiste) {
  console.log(`\nO usuário "${usuario}" já está na tabela:`);
  console.log(`  papel: ${jaExiste.papel}   status: ${jaExiste.status}\n`);

  if (jaExiste.papel !== "admin" || jaExiste.status !== "aprovado") {
    const { error } = await supabase
      .from("usuarios")
      .update({ papel: "admin", status: "aprovado" })
      .eq("id", jaExiste.id);

    if (error) {
      console.error("Não consegui atualizar:", error.message);
      process.exit(1);
    }
    console.log("Atualizado para admin aprovado.\n");
  }
} else {
  const { error } = await supabase.from("usuarios").insert({
    usuario,
    senha_hash: senhaHash,
    papel: "admin",
    status: "aprovado",
  });

  if (error) {
    console.error("\nNão consegui criar o admin:", error.message, "\n");
    process.exit(1);
  }
  console.log(`\nAdministrador "${usuario}" criado. Mesma senha de antes.\n`);
}

const { data: todos } = await supabase
  .from("usuarios")
  .select("usuario, papel, status")
  .order("id");

console.log("Usuários na tabela agora:");
for (const u of todos ?? []) {
  console.log(`  ${u.usuario.padEnd(20)} ${u.papel.padEnd(8)} ${u.status}`);
}
console.log("");
