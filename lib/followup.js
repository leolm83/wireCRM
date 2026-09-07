import Anthropic from "@anthropic-ai/sdk";

// Escreve a mensagem de follow-up chamando a API do Claude.
//
// Este arquivo roda SÓ NO SERVIDOR. A chave da API não tem prefixo
// NEXT_PUBLIC_, então nunca chega ao navegador — se chegasse, qualquer
// visitante poderia copiá-la e gastar os créditos da conta.

const MODELO = "claude-sonnet-5";

// O que a IA deve fazer, sempre. Fica separado dos dados do contato para
// as instruções não se misturarem com o texto das anotações.
const INSTRUCOES = `Você escreve mensagens curtas de retorno (follow-up) para o dono de um pequeno negócio enviar aos contatos dele.

TOM: profissional, caloroso e direto. Português do Brasil, natural, como uma pessoa escreve — não como um modelo de carta.

REGRAS:
- De 2 a 4 frases. Curta de verdade.
- Escreva só a mensagem, pronta para enviar. Sem assunto de e-mail, sem assinatura, sem despedida formal.
- Use APENAS os fatos que estiverem nas anotações. Nunca invente reuniões, valores, prazos, nomes ou combinados que não estejam escritos ali.
- NUNCA escreva lacunas para preencher. Nada de colchetes, nada de [nome], [área], [empresa], [data]. Se você não sabe alguma coisa, simplesmente não fale dela.
- Sem emoji.
- Não comece com fórmulas vazias do tipo "Espero que esteja bem".
- Se houver um próximo passo claro nas anotações, encaminhe para ele.

NUNCA SE APRESENTE:
Não diga o nome de quem envia nem o nome da empresa — você não os conhece, e quem recebe já vê de quem é a mensagem. Também não use reticências ("Me chamo...") para pular o que você não sabe: isso é uma lacuna disfarçada e vale a mesma proibição dos colchetes.

QUANDO NÃO HOUVER ANOTAÇÕES:
Você não sabe o que o remetente vende, em que ramo atua, nem como os dois se conhecem. Não invente nada disso. Escreva só um convite curto e cordial para uma conversa.

O QUE A ETAPA DO FUNIL SIGNIFICA:
- novo: ainda não houve conversa. Faça uma primeira aproximação.
- em contato: a conversa está viva. Retome de onde parou.
- proposta: há proposta na mesa. Acompanhe a decisão sem pressionar.
- cliente: já fechou. Cuide do relacionamento.

Responda somente com a mensagem. Sem comentários seus, sem aspas em volta, sem explicação.`;

function montarDadosDoContato(contato, anotacoes) {
  const linhas = [
    `Nome: ${contato.nome}`,
    `Etapa do funil: ${contato.etapa}`,
    "",
  ];

  if (anotacoes.length === 0) {
    linhas.push("Anotações: nenhuma ainda. Não há histórico de conversa.");
  } else {
    linhas.push("Anotações, da mais recente para a mais antiga:");
    for (const anotacao of anotacoes) {
      linhas.push(`- (${anotacao.data}) ${anotacao.texto}`);
    }
  }

  return linhas.join("\n");
}

export async function escreverFollowUp(contato, anotacoes) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Falta ANTHROPIC_API_KEY no .env.local");
    return { ok: false, erro: "A geração por IA ainda não está configurada." };
  }

  const cliente = new Anthropic();

  try {
    const resposta = await cliente.messages.create({
      model: MODELO,
      // A saída é curta de propósito, então um teto baixo basta.
      max_tokens: 2048,
      // Escrever 3 frases é tarefa simples: esforço baixo sai mais rápido
      // e mais barato, sem perder qualidade aqui.
      output_config: { effort: "low" },
      system: INSTRUCOES,
      messages: [
        {
          role: "user",
          content: montarDadosDoContato(contato, anotacoes),
        },
      ],
    });

    // content é uma lista de blocos; juntamos só os de texto.
    const mensagem = resposta.content
      .filter((bloco) => bloco.type === "text")
      .map((bloco) => bloco.text)
      .join("")
      .trim();

    if (!mensagem) {
      return { ok: false, erro: "Não consegui escrever a mensagem. Tente de novo." };
    }

    return { ok: true, mensagem };
  } catch (erro) {
    // O detalhe técnico fica no log do servidor. Para a tela vai só
    // uma frase que a pessoa consegue entender e agir.
    console.error("Erro ao gerar follow-up:", erro);

    if (erro instanceof Anthropic.AuthenticationError) {
      return { ok: false, erro: "A chave da IA não foi aceita. Confira a configuração." };
    }
    if (erro instanceof Anthropic.RateLimitError) {
      return { ok: false, erro: "Muitos pedidos seguidos. Espere um instante e tente de novo." };
    }
    if (erro instanceof Anthropic.APIConnectionError) {
      return { ok: false, erro: "Não consegui falar com a IA. Verifique sua conexão." };
    }

    return { ok: false, erro: "Não consegui escrever a mensagem agora. Tente de novo." };
  }
}
