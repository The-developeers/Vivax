import Link from "next/link";
import { Briefcase, User } from "lucide-react";
import { AuthBackground } from "@/components/AuthBackground";

export default function SelectProfilePage() {
  return (
    <AuthBackground>
      <div className="mt-12 flex w-full flex-1 flex-col items-center gap-10 text-center">
        <h1 className="text-2xl font-bold leading-tight">
          Selecione o seu
          <br />
          tipo de perfil
        </h1>

        <div className="grid w-full grid-cols-2 gap-4">
          <Link
            href="/cadastro/morador"
            className="flex flex-col items-center gap-3 rounded-2xl bg-offwhite px-4 py-8 text-charcoal transition-transform active:scale-95"
          >
            <User className="h-10 w-10" strokeWidth={1.5} />
            <span className="text-sm font-medium">Morador/Visitante</span>
          </Link>

          <Link
            href="/cadastro/empreendedor"
            className="flex flex-col items-center gap-3 rounded-2xl bg-offwhite px-4 py-8 text-charcoal transition-transform active:scale-95"
          >
            <Briefcase className="h-10 w-10" strokeWidth={1.5} />
            <span className="text-sm font-medium">Empreendedor Local</span>
          </Link>
        </div>
      </div>
    </AuthBackground>
  );
}
