"use client";

import React from "react";

interface RankAvatarProps {
  nome: string;
  initials: string;
  photoUrl: string | null;
  className?: string;
  fallbackClassName?: string;
}

/** Avatar circular com foto ou iniciais (reutilizado em pódio, tabela e Corretor do Mês). */
export function RankAvatar({ nome, initials, photoUrl, className = "w-7 h-7 text-xs", fallbackClassName = "bg-connect-blue text-white" }: RankAvatarProps) {
  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photoUrl} alt={nome} className={`${className} rounded-full object-cover shrink-0`} />;
  }
  return (
    <div className={`${className} ${fallbackClassName} rounded-full flex items-center justify-center font-bold shrink-0`}>
      {initials}
    </div>
  );
}
