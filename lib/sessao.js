import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { buscarUsuarioPorId } from "./usuarios";

// Sessão: como o CRM lembra que você entrou.
//
// Depois do login, o servidor guarda um bilhete no navegador (um cookie).
// O bilhete diz de quem é e até quando vale, e vem com uma assinatura feita
// com um segredo que só o servidor conhece. Se alguém mexer em uma vírgula
// do bilhete, a assinatura não confere mais e ele é recusado.
//
// O bilhete guarda o NÚMERO do usuário, não o papel nem o status. Papel e
// status são buscados no banco a cada visita — assim, quando o admin muda
// alguma coisa, vale na hora, sem precisar esperar a sessão vencer.

const NOME_DO_COOKIE = "crm_sessao";
const DURACAO_EM_SEGUNDOS = 60 * 60 * 12; // 12 horas

function assinar(texto) {
  const segredo = process.env.CRM_SESSAO_SEGREDO;
  if (!segredo) {
    throw new Error("Falta CRM_SESSAO_SEGREDO no .env.local");
  }
  return createHmac("sha256", segredo).update(texto).digest("hex");
}

export async function criarSessao(idDoUsuario) {
  const expiraEm = Date.now() + DURACAO_EM_SEGUNDOS * 1000;
  const conteudo = `${idDoUsuario}|${expiraEm}`;
  const bilhete = `${Buffer.from(conteudo).toString("base64url")}.${assinar(conteudo)}`;

  const armazem = await cookies();
  armazem.set(NOME_DO_COOKIE, bilhete, {
    // httpOnly: nenhum JavaScript da página consegue ler este cookie.
    httpOnly: true,
    // sameSite lax: o cookie não é enviado em requisições vindas de outros sites.
    sameSite: "lax",
    // Em produção, só trafega por HTTPS.
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACAO_EM_SEGUNDOS,
  });
}

export async function encerrarSessao() {
  const armazem = await cookies();
  armazem.delete(NOME_DO_COOKIE);
}

// Devolve o usuário inteiro se o bilhete for válido E ele estiver aprovado.
// Qualquer outra situação devolve null.
export async function lerSessao() {
  const armazem = await cookies();
  const bilhete = armazem.get(NOME_DO_COOKIE)?.value;
  if (!bilhete) return null;

  const partes = bilhete.split(".");
  if (partes.length !== 2) return null;

  const [conteudoCodificado, assinaturaRecebida] = partes;

  let conteudo;
  try {
    conteudo = Buffer.from(conteudoCodificado, "base64url").toString("utf8");
  } catch {
    return null;
  }

  let esperada;
  try {
    esperada = assinar(conteudo);
  } catch {
    return null;
  }

  const recebidaBytes = Buffer.from(assinaturaRecebida);
  const esperadaBytes = Buffer.from(esperada);
  if (recebidaBytes.length !== esperadaBytes.length) return null;
  if (!timingSafeEqual(recebidaBytes, esperadaBytes)) return null;

  const [idTexto, expiraEm] = conteudo.split("|");
  const id = Number(idTexto);
  if (!Number.isInteger(id) || id <= 0) return null;
  if (!Number(expiraEm) || Number(expiraEm) < Date.now()) return null;

  const usuario = await buscarUsuarioPorId(id);
  if (!usuario) return null;
  // Quem ainda não foi aprovado não entra, mesmo com bilhete válido.
  if (usuario.status !== "aprovado") return null;

  return usuario;
}

// Usar no início de toda tela interna e de toda ação que mexe em dados.
export async function exigirSessao() {
  const usuario = await lerSessao();
  if (!usuario) {
    redirect("/login");
  }
  return usuario;
}

// Diz se quem está usando é administrador. Devolve false em vez de
// redirecionar, para as ações poderem responder com uma mensagem.
export async function ehAdmin() {
  const usuario = await lerSessao();
  return usuario?.papel === "admin";
}

// Para as partes que só o administrador pode ver ou fazer.
export async function exigirAdmin() {
  const usuario = await exigirSessao();
  if (usuario.papel !== "admin") {
    redirect("/");
  }
  return usuario;
}
