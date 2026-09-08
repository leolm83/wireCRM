import { supabase } from "@/lib/supabase";
import { exigirSessao } from "@/lib/sessao";
import ContatoItem from "./contato-item";

// A lista de contatos: busca no banco e desenha na tela.
//
// Fica aqui, sozinha, porque duas telas mostram a mesma lista — o Funil e
// Contatos. Assim a lista tem uma definição só: mudar a lista é mexer
// neste arquivo, e as duas telas mudam junto.

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

export default async function ListaContatos({ mensagemVazia }) {
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

  if (error) {
    return <div className="aviso">Não consegui buscar os contatos no banco.</div>;
  }

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

  if (contatos.length === 0) {
    return <div className="aviso">{mensagemVazia}</div>;
  }

  return (
    <div className="lista-contatos">
      {contatos.map((contato) => (
        <ContatoItem key={contato.id} contato={contato} ehAdmin={ehAdmin} />
      ))}
    </div>
  );
}
