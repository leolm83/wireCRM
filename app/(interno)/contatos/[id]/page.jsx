import { notFound } from "next/navigation";
import { exigirSessao } from "@/lib/sessao";
import { supabase } from "@/lib/supabase";
import { tempoDesde } from "@/lib/tempo";

// A página de um contato. Por enquanto ela mostra só o que o contato é:
// nome, email, telefone e etapa. Anotações, os follow-ups guardados e a
// busca são o item 2 da v2 e entram aqui depois.
//
// A sessão é conferida na própria função, logo abaixo.
export const dynamic = "force-dynamic";

const CLASSE_DA_ETAPA = {
  novo: "etapa-novo",
  "em contato": "etapa-em-contato",
  proposta: "etapa-proposta",
  cliente: "etapa-cliente",
};

// O título da aba leva o nome de quem está aberto.
export async function generateMetadata({ params }) {
  const { id } = await params;
  const contato = await buscarContato(id);

  return { title: contato ? `${contato.nome} — WireCRM` : "Contato — WireCRM" };
}

async function buscarContato(idBruto) {
  const id = Number(idBruto);

  // O endereço vem da barra do navegador, então pode vir qualquer coisa.
  // Só um inteiro positivo e de tamanho normal vai ao banco: letra, vírgula
  // e número absurdo já não existem, e não vale gastar uma consulta com eles.
  // (isSafeInteger, e não isInteger: 1e21 passa por inteiro e o banco recusa.)
  if (!Number.isSafeInteger(id) || id <= 0) return null;

  const { data, error } = await supabase
    .from("contatos")
    .select("id, nome, email, telefone, etapa, criado_em")
    .eq("id", id)
    .maybeSingle();

  // Falha do banco não é a mesma coisa que contato inexistente. As duas
  // levam à mesma tela de não encontrado, mas só uma precisa aparecer no
  // log do servidor para alguém poder investigar.
  if (error) {
    console.error("Erro ao buscar contato:", error);
    return null;
  }

  return data ?? null;
}

export default async function PaginaDoContato({ params }) {
  // Confere a sessão aqui, na própria tela, e não só no layout de (interno).
  // O layout do Next não é redesenhado quando se navega de uma tela para
  // outra vizinha — então confiar só nele deixaria esta tela abrir com a
  // sessão já vencida. Uma linha aqui fecha essa brecha.
  await exigirSessao();

  const { id } = await params;
  const contato = await buscarContato(id);

  // Contato que não existe (ou foi apagado) devolve a tela de 404 do Next.
  if (!contato) {
    notFound();
  }

  return (
    <main className="pagina">
      <header className="cabecalho">
        <div className="cabecalho-topo">
          <h1>{contato.nome}</h1>
          <span className={`etiqueta ${CLASSE_DA_ETAPA[contato.etapa] ?? ""}`}>
            {contato.etapa}
          </span>
        </div>
        <p className="apoio">
          No funil desde <span className="mono">{tempoDesde(contato.criado_em)}</span>.
        </p>
      </header>

      <section className="cartao">
        <h2>Dados</h2>
        <dl className="dados-contato">
          <div className="dado">
            <dt>Email</dt>
            <dd>{contato.email || <span className="apoio">Não informado</span>}</dd>
          </div>
          <div className="dado">
            <dt>Telefone</dt>
            <dd>{contato.telefone || <span className="apoio">Não informado</span>}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
