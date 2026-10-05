"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Share } from "lucide-react";
import { usePwaInstall } from "./usePwaInstall";

export function PwaInstallPrompt() {
  const { isInstallable, isInstalled, isIOS, triggerInstall } = usePwaInstall();
  const [isDismissed, setIsDismissed] = useState(true);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Verifica se o usuário já dispensou o aviso recentemente
    const dismissedTime = localStorage.getItem("cp_pwa_dismissed");
    if (dismissedTime) {
      const diff = Date.now() - Number(dismissedTime);
      // Se dispensou há menos de 7 dias, não exibe
      if (diff < 7 * 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
        return;
      }
    }

    if (isInstallable || (isIOS && !isInstalled)) {
      setIsDismissed(false);
    }
  }, [isInstallable, isInstalled, isIOS]);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("cp_pwa_dismissed", String(Date.now()));
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }
    await triggerInstall();
  };

  if (isDismissed || isInstalled) return null;

  return (
    <>
      {/* Banner flutuante no rodapé em mobile / desktop */}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-fade-in-up">
        <div className="bg-card border border-border/80 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-connect-blue/15 border border-connect-blue/30 flex items-center justify-center flex-shrink-0 text-connect-blue">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground leading-tight">
                Instalar Connect Platz CRM
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5">
                Acesso rápido na tela inicial como app nativo
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-connect-blue hover:bg-connect-deep-blue text-white text-xs font-bold shadow-md shadow-connect-blue/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Dispensar"
              aria-label="Dispensar aviso de instalação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal explicativo para iOS Safari */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-connect-blue" />
                <h3 className="text-sm font-bold text-foreground">Instalar no iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-connect-blue/20 text-connect-blue font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                  1
                </span>
                <span>
                  No Safari, toque no botão <strong>Compartilhar</strong> (ícone{" "}
                  <Share className="inline w-3.5 h-3.5 text-connect-blue mb-0.5" /> na barra
                  inferior).
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-connect-blue/20 text-connect-blue font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                  2
                </span>
                <span>
                  Role a lista e selecione <strong>Adicionar à Tela de Início</strong>.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-connect-blue/20 text-connect-blue font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                  3
                </span>
                <span>
                  Toque em <strong>Adicionar</strong> no canto superior direito para concluir.
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowIOSInstructions(false);
                handleDismiss();
              }}
              className="w-full py-2.5 rounded-xl bg-connect-blue text-white text-xs font-bold hover:bg-connect-deep-blue transition-all"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
