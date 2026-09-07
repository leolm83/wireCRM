// Regras de validação dos campos de contato.
//
// Este arquivo é usado nas DUAS pontas: pelo formulário no navegador (para
// avisar o usuário na hora) e pela ação no servidor (para valer de verdade).
// Ficando num lugar só, as duas nunca discordam sobre o que é válido.
//
// Por que validar duas vezes: o navegador dá o aviso rápido, mas pode ser
// contornado. O servidor é a checagem que realmente protege o banco.

const NOME_MINIMO = 3;
const NOME_MAXIMO = 255;
const EMAIL_MAXIMO = 254; // limite oficial de tamanho de email

// Formato de email do padrão HTML5 — o mesmo que os navegadores usam —
// com a exigência a mais de ter um ponto no domínio.
const FORMATO_EMAIL =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Os DDDs que existem de fato no Brasil. Números como 20, 23 ou 90 nunca
// foram atribuídos, então recusamos.
const DDDS_DO_BRASIL = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19,
  21, 22, 24, 27, 28,
  31, 32, 33, 34, 35, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48, 49,
  51, 53, 54, 55,
  61, 62, 63, 64, 65, 66, 67, 68, 69,
  71, 73, 74, 75, 77, 79,
  81, 82, 83, 84, 85, 86, 87, 88, 89,
  91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

// Tira tudo que não for número: parênteses, traços, espaços.
export function apenasDigitos(texto) {
  return String(texto ?? "").replace(/\D/g, "");
}

// Deixa o telefone no formato (11) 98877-1234. Se não der para formatar,
// devolve o que veio.
export function formatarTelefone(texto) {
  const digitos = apenasDigitos(texto);

  if (digitos.length === 11) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  }
  if (digitos.length === 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return String(texto ?? "");
}

export function validarNome(valor) {
  const nome = String(valor ?? "").trim();

  if (!nome) {
    return "O nome é obrigatório.";
  }
  if (nome.length < NOME_MINIMO) {
    return `O nome precisa ter pelo menos ${NOME_MINIMO} caracteres.`;
  }
  if (nome.length > NOME_MAXIMO) {
    return `O nome pode ter no máximo ${NOME_MAXIMO} caracteres.`;
  }
  return null;
}

export function validarEmail(valor) {
  const email = String(valor ?? "").trim();

  if (!email) {
    return "O email é obrigatório.";
  }
  if (email.length > EMAIL_MAXIMO) {
    return "Esse email é longo demais.";
  }
  if (!FORMATO_EMAIL.test(email)) {
    return "Email inválido. Exemplo: nome@empresa.com.br";
  }
  return null;
}

export function validarTelefone(valor) {
  const digitos = apenasDigitos(valor);

  if (!digitos) {
    return "O telefone é obrigatório.";
  }
  if (digitos.length !== 10 && digitos.length !== 11) {
    return "Telefone precisa ter DDD + 8 ou 9 dígitos. Exemplo: (11) 98877-1234";
  }

  const ddd = Number(digitos.slice(0, 2));
  if (!DDDS_DO_BRASIL.has(ddd)) {
    return `DDD ${digitos.slice(0, 2)} não existe no Brasil.`;
  }

  const primeiroDigito = digitos[2];

  // 11 dígitos = celular, que sempre começa com 9.
  if (digitos.length === 11 && primeiroDigito !== "9") {
    return "Celular precisa começar com 9 depois do DDD.";
  }
  // 10 dígitos = telefone fixo, que começa de 2 a 5.
  if (digitos.length === 10 && !"2345".includes(primeiroDigito)) {
    return "Telefone fixo precisa começar com 2, 3, 4 ou 5 depois do DDD.";
  }

  return null;
}

// --------------------------------------------------------------------
// Cadastro de usuário
// --------------------------------------------------------------------

const USUARIO_MINIMO = 3;
const USUARIO_MAXIMO = 50;
const SENHA_MINIMA = 8;
// Teto generoso: nenhuma senha de verdade chega perto disso. Serve para
// impedir que alguém mande um texto gigante só para fazer o servidor
// gastar tempo embaralhando (o scrypt é lento de propósito).
const SENHA_MAXIMA = 200;

// O mesmo teto do campo na tela. Repetido aqui porque o limite do
// navegador pode ser contornado; este não.
const ANOTACAO_MAXIMA = 2000;

// Letras sem acento, números, ponto, hífen e underscore.
const FORMATO_USUARIO = /^[a-zA-Z0-9._-]+$/;

export function validarNomeDeUsuario(valor) {
  const usuario = String(valor ?? "").trim();

  if (!usuario) return "Escolha um nome de usuário.";
  if (usuario.length < USUARIO_MINIMO) {
    return `O usuário precisa ter pelo menos ${USUARIO_MINIMO} caracteres.`;
  }
  if (usuario.length > USUARIO_MAXIMO) {
    return `O usuário pode ter no máximo ${USUARIO_MAXIMO} caracteres.`;
  }
  if (!FORMATO_USUARIO.test(usuario)) {
    return "Use apenas letras sem acento, números, ponto, hífen ou _";
  }
  return null;
}

export function validarSenhaNova(valor) {
  const senha = String(valor ?? "");

  if (!senha) return "Escolha uma senha.";
  if (senha.length < SENHA_MINIMA) {
    return `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`;
  }
  if (senha.length > SENHA_MAXIMA) {
    return `A senha pode ter no máximo ${SENHA_MAXIMA} caracteres.`;
  }
  return null;
}

// Teto de tamanho para a senha digitada no login. Não diz nada sobre a
// senha estar certa — só evita processar um texto absurdo.
export function senhaCabeNoLimite(valor) {
  return String(valor ?? "").length <= SENHA_MAXIMA;
}

export function validarTextoDeAnotacao(valor) {
  const texto = String(valor ?? "").trim();

  if (!texto) return "Escreva a anotação antes de salvar.";
  if (texto.length > ANOTACAO_MAXIMA) {
    return `A anotação pode ter no máximo ${ANOTACAO_MAXIMA} caracteres.`;
  }
  return null;
}

// --------------------------------------------------------------------

// Valida os três campos de uma vez. Devolve um objeto só com os que
// deram problema — vazio quer dizer que está tudo certo.
export function validarContato(valores) {
  const erros = {};

  const erroNome = validarNome(valores.nome);
  const erroEmail = validarEmail(valores.email);
  const erroTelefone = validarTelefone(valores.telefone);

  if (erroNome) erros.nome = erroNome;
  if (erroEmail) erros.email = erroEmail;
  if (erroTelefone) erros.telefone = erroTelefone;

  return erros;
}
