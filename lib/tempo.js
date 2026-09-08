// "há 3 dias", "ontem", "há 2 meses".
//
// Mora aqui porque duas telas escrevem isso: o quadro do funil e o
// dashboard. O texto é montado sempre no servidor, para ser o mesmo que o
// navegador desenha depois — se cada lado calculasse por conta, os dois
// podiam discordar e a tela piscaria ao carregar.

const RELATIVO = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

export function tempoDesde(valor) {
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
