"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

interface AccessDeniedCardProps {
  moduleName?: string;
}

export function AccessDeniedCard({ moduleName = "este módulo" }: AccessDeniedCardProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/5">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <h2 className="text-xl font-bold text-foreground mb-2">Acesso Restrito à Gestão</h2>

      <p className="text-xs text-muted-foreground max-w-md leading-relaxed mb-6">
        Seu perfil de <span className="font-semibold text-foreground">Corretor</span> não possui
        permissão para visualizar ou editar {moduleName}. Esta área é restrita a
        Administradores e Diretores da imobiliária.
      </p>

      <Link
        href="/crm"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-connect-blue hover:bg-connect-blue/90 text-white shadow-md shadow-connect-blue/20 transition-all hover:scale-[1.02]"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para o Dashboard
      </Link>
    </div>
  );
}
