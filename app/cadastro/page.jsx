import Link from "next/link";
import { redirect } from "next/navigation";
import { lerSessao } from "@/lib/sessao";
import FormularioCadastro from "./formulario-cadastro";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Criar cadastro — Meu CRM",
};

export default async function PaginaDeCadastro() {
  // Quem já entrou não precisa se cadastrar de novo.
  const sessao = await lerSessao();
  if (sessao) {
    redirect("/");
  }

  return (
    <main className="pagina-login">
      <div className="cartao cartao-login">
        <h1>Criar cadastro</h1>
        <p className="apoio">
          Seu acesso passa por aprovação do administrador antes de valer.
        </p>

        <FormularioCadastro />

        <p className="troca-de-tela">
          Já tem cadastro? <Link href="/login">Entrar</Link>
        </p>
      </div>
    </main>
  );
}
