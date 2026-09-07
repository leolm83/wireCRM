import { createClient } from "@supabase/supabase-js";

// Conexão única com o Supabase, usada por toda a aplicação.
//
// ATENÇÃO: este arquivo roda SÓ NO SERVIDOR. Nenhuma das duas variáveis
// abaixo tem o prefixo NEXT_PUBLIC_, então o Next.js não envia nenhuma
// delas para o navegador — lá elas seriam simplesmente vazias.
//
// Na prática: as telas buscam os dados no servidor e mandam o resultado
// pronto para o navegador. Endereço e chave nunca saem daqui.

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error(
    "Faltam variáveis de ambiente do Supabase. Confira o arquivo .env.local"
  );
}

export const supabase = createClient(supabaseUrl, supabaseSecretKey);
