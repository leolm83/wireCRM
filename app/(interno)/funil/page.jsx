import { exigirSessao } from "@/lib/sessao";
import { supabase } from "@/lib/supabase";
import { tempoDesde } from "@/lib/tempo";
import QuadroFunil from "../../quadro-funil";

// O funil como quadro: uma coluna por etapa, um cartão por contato.
// A tela confere a sessão por conta própria, logo abaixo; o layout de
// (interno) confere também, como segunda camada.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Funil — WireCRM",
};

export default async function PaginaDoFunil() {
  // Mover contato de etapa é coisa de administrador. Quem é comum vê o
  // quadro, mas os cartões não saem do lugar — e a ação no servidor recusa
  // de qualquer jeito, caso alguém force.
  const usuario = await exigirSessao();

  // O quadro só precisa do cabeçalho de cada contato. Anotações e follow-up
  // ficam na página do contato.
  const { data, error } = await supabase
    .from("contatos")
    .select("id, nome, email, etapa, criado_em")
    .order("criado_em", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    return (
      <main className="pagina">
        <header className="cabecalho">
          <h1>Funil</h1>
        </header>
        <div className="aviso">Não consegui buscar os contatos no banco.</div>
      </main>
    );
  }

  const contatos = (data ?? []).map((contato) => ({
    id: contato.id,
    nome: contato.nome,
    email: contato.email || "Sem email",
    etapa: contato.etapa,
    desde: tempoDesde(contato.criado_em),
  }));

  return <QuadroFunil contatos={contatos} ehAdmin={usuario.papel === "admin"} />;
}
