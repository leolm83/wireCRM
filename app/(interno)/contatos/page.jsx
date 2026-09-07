import { supabase } from "@/lib/supabase";
import { exigirSessao } from "@/lib/sessao";
import FormularioContato from "../../formulario-contato";
import ContatoItem from "../../contato-item";

// A proteção fica no layout desta pasta — toda página aqui dentro já
// exige sessão antes de rodar.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contatos — Meu CRM",
};

// Data por extenso, no fuso do Brasil. A formatação acontece aqui, no
// servidor, para o texto ser o mesmo que o navegador desenha depois.
const FORMATO_DE_DATA = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

function formatarData(valor) {
  return FORMATO_DE_DATA.format(new Date(valor)).replace(",", " às");
}

// Junta email e telefone numa linha só, pulando os que estiverem vazios.
function dadosDeContato(contato) {
  const partes = [contato.email, contato.telefone].filter(Boolean);
  return partes.length > 0 ? partes.join("  ·  ") : "Sem email ou telefone";
}

export default async function PaginaDeContatos() {
  // Quem não é administrador lê e cadastra, mas não altera o que existe
  // nem gera follow-up. Os controles nem aparecem para essa pessoa — e as
  // ações no servidor recusam de qualquer jeito, caso alguém force.
  const usuario = await exigirSessao();
  const ehAdmin = usuario.papel === "admin";

  // "*, anotacoes(*)" traz cada contato junto com as anotações dele,
  // numa consulta só.
  const { data, error } = await supabase
    .from("contatos")
    .select("*, anotacoes(*)")
    .order("criado_em", { ascending: false })
    .order("id", { ascending: false });

  // Deixa tudo pronto para a tela: datas já escritas e anotações da
  // mais recente para a mais antiga.
  const contatos = (data ?? []).map((contato) => ({
    id: contato.id,
    nome: contato.nome,
    etapa: contato.etapa,
    dados: dadosDeContato(contato),
    anotacoes: [...(contato.anotacoes ?? [])]
      .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))
      .map((anotacao) => ({
        id: anotacao.id,
        texto: anotacao.texto,
        data: formatarData(anotacao.criado_em),
      })),
  }));

  return (
    <main className="pagina">
      <header className="cabecalho">
        <h1>Contatos</h1>
        <p className="apoio">
          Contatos e oportunidades de negócio em um só lugar.
        </p>
      </header>

      <section className="cartao">
        <h2>Novo contato</h2>
        <FormularioContato />
      </section>

      <section className="secao-lista">
        <h2>Contatos</h2>

        {error ? (
          <div className="aviso">Não consegui buscar os contatos no banco.</div>
        ) : contatos.length === 0 ? (
          <div className="aviso">
            Nenhum contato ainda. Cadastre o primeiro no formulário acima.
          </div>
        ) : (
          <div className="lista-contatos">
            {contatos.map((contato) => (
              <ContatoItem
                key={contato.id}
                contato={contato}
                ehAdmin={ehAdmin}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
