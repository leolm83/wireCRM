import Link from "next/link";
import { redirect } from "next/navigation";
import { lerSessao } from "@/lib/sessao";
import FormularioLogin from "./formulario-login";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Entrar — Meu CRM",
};

export default async function PaginaLogin() {
  // Quem já entrou não precisa ver esta tela.
  const sessao = await lerSessao();
  if (sessao) {
    redirect("/");
  }

  return (
    <main className="pagina-login">
      <div className="cartao cartao-login">
        <h1>Meu CRM</h1>
        <p className="apoio">Entre para continuar.</p>

        <FormularioLogin />

        <p className="troca-de-tela">
          Ainda não tem cadastro? <Link href="/cadastro">Criar cadastro</Link>
        </p>
      </div>
    </main>
  );
}
