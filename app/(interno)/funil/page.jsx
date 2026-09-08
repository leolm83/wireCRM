import { exigirSessao } from "@/lib/sessao";
import { supabase } from "@/lib/supabase";
import QuadroFunil from "../../quadro-funil";

// O funil como quadro: uma coluna por etapa, um cartão por contato.
// A proteção fica no layout desta pasta — toda página aqui dentro já
// exige sessão antes de rodar.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Funil — WireCRM",
};

// "há 3 dias", "ontem", "há 2 meses". O texto é montado aqui, no servidor,
// para ser o mesmo que o navegador desenha depois — se cada lado calculasse
// por conta, os dois podiam discordar.
const RELATIVO = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

function tempoDesde(valor) {
  const segundos = Math.floor((Date.now() - new Date(valor).getTime()) / 1000);

  if (segundos < 60) return "agora há pouco";

  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return RELATIVO.format(-minutos, "minute");

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return RELATIVO.format(-horas, "hour");

  const dias = Math.floor(horas / 24);
  if (dias < 30) return RELATIVO.format(-dias, "day");

  const meses = Math.floor(dias / 30);
  if (meses < 12) return RELATIVO.format(-meses, "month");

  return RELATIVO.format(-Math.floor(meses / 12), "year");
}

export default async function PaginaDoFunil() {
  // Mover contato de etapa é coisa de administrador. Quem é comum vê o
  // quadro, mas os cartões não saem do lugar — e a ação no servidor recusa
  // de qualquer jeito, caso alguém force.
  const usuario = await exigirSessao();

  // O quadro só precisa do cabeçalho de cada contato. Anotações e follow-up
  // ficam para a página do contato, que ainda não existe.
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
