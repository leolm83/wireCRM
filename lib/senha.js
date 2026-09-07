import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

// Embaralhamento de senha ("hash").
//
// A senha nunca é guardada como texto. O que fica salvo é o resultado de
// uma conta que só vai num sentido: dá para conferir se uma senha bate,
// mas não dá para voltar do resultado até a senha original.
//
// Usamos scrypt, que vem pronto no Node — não precisa instalar nada. Ele é
// feito de propósito para ser LENTO e comer memória, o que torna inviável
// testar bilhões de senhas por segundo.

const scryptAsync = promisify(scrypt);

const TAMANHO_DO_SAL = 16;
const TAMANHO_DA_CHAVE = 64;

// Gera o valor que vai para o arquivo de segredos.
// Formato: sal:resultado — os dois em hexadecimal.
export async function gerarHashDeSenha(senha) {
  // O "sal" é um punhado de bytes aleatórios misturado à senha antes da
  // conta. É o que faz duas pessoas com a mesma senha terem resultados
  // diferentes, e o que impede o uso de tabelas prontas de senhas comuns.
  const sal = randomBytes(TAMANHO_DO_SAL);
  const derivada = await scryptAsync(
    senha.normalize("NFKC"),
    sal,
    TAMANHO_DA_CHAVE
  );

  return `${sal.toString("hex")}:${derivada.toString("hex")}`;
}

// Confere se a senha digitada corresponde ao hash guardado.
export async function senhaConfere(senha, hashGuardado) {
  const partes = String(hashGuardado ?? "").split(":");
  if (partes.length !== 2) return false;

  const [salHex, derivadaHex] = partes;
  if (!salHex || !derivadaHex) return false;

  let sal;
  let guardada;
  try {
    sal = Buffer.from(salHex, "hex");
    guardada = Buffer.from(derivadaHex, "hex");
  } catch {
    return false;
  }

  if (sal.length === 0 || guardada.length === 0) return false;

  const calculada = await scryptAsync(
    String(senha ?? "").normalize("NFKC"),
    sal,
    guardada.length
  );

  // timingSafeEqual compara os dois valores sempre no mesmo tempo. Uma
  // comparação comum pararia no primeiro byte diferente, e medir esse
  // tempo permitiria descobrir a senha aos poucos.
  return timingSafeEqual(guardada, calculada);
}
