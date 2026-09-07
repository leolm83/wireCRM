import { createInterface } from "node:readline";
import { randomBytes } from "node:crypto";
import { gerarHashDeSenha } from "../lib/senha.js";

// Gera as três linhas de acesso para colar no .env.local.
// A senha digitada não aparece na tela e não é guardada em lugar nenhum:
// só o resultado embaralhado dela é impresso.

const leitor = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

let esconderDigitacao = false;

// Enquanto a senha é digitada, nada é ecoado na tela.
leitor._writeToOutput = function (texto) {
  if (!esconderDigitacao) {
    leitor.output.write(texto);
  }
};

function perguntar(pergunta, ocultar = false) {
  return new Promise((resolver) => {
    leitor.question(pergunta, (resposta) => {
      esconderDigitacao = false;
      if (ocultar) leitor.output.write("\n");
      resolver(resposta);
    });
    esconderDigitacao = ocultar;
  });
}

console.log("\n=== Definir acesso do CRM ===\n");

const usuario = (await perguntar("Usuário: ")).trim();
if (!usuario) {
  console.error("\nUsuário não pode ficar vazio.");
  process.exit(1);
}

const senha = await perguntar("Senha (não aparece na tela): ", true);
if (senha.length < 8) {
  console.error("\nUse uma senha de pelo menos 8 caracteres.");
  process.exit(1);
}

const confirmacao = await perguntar("Repita a senha: ", true);
if (senha !== confirmacao) {
  console.error("\nAs senhas não são iguais. Rode de novo.");
  process.exit(1);
}

leitor.close();

const hash = await gerarHashDeSenha(senha);
// Segredo usado para assinar o cookie de sessão.
const segredoDaSessao = randomBytes(32).toString("hex");

console.log("\n--- Cole estas três linhas no final do .env.local ---\n");
console.log(`CRM_USUARIO=${usuario}`);
console.log(`CRM_SENHA_HASH=${hash}`);
console.log(`CRM_SESSAO_SEGREDO=${segredoDaSessao}`);
console.log("\n-----------------------------------------------------");
console.log("A senha em si não foi guardada em lugar nenhum.\n");
