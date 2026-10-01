"use client";

import React, { useState } from "react";
import { MapPin, Sparkles, CheckCircle2 } from "lucide-react";
import { PropertyItem } from "./PortalPropertyCard";

interface PortalContactModalProps {
  property: PropertyItem | null;
  onClose: () => void;
  formatPrice: (prop: PropertyItem) => string;
}

export function PortalContactModal({
  property,
  onClose,
  formatPrice,
}: PortalContactModalProps) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [corretorAtribuido, setCorretorAtribuido] = useState<string | null>(null);

  if (!property) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);

    try {
      const res = await fetch("/api/leads/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          telefone,
          email,
          propertyId: property.id,
          propertyNome: property.nome,
          mensagem,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setEnviado(true);
        setCorretorAtribuido(data.assignedCorretor || "Equipe de Plantão");
        setTimeout(() => {
          setEnviado(false);
          onClose();
          setNome("");
          setTelefone("");
          setEmail("");
          setMensagem("");
          setCorretorAtribuido(null);
        }, 4000);
      } else {
        alert(data.error || "Erro ao registrar interesse.");
      }
    } catch (err) {
      console.error(err);
      alert("Falha de conexão ao enviar seus dados. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  const isTemporada = property.modalidade === "VERANEIO_TEMPORADA";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-[#1F2937] rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg font-bold"
        >
          ✕
        </button>

        {/* Header do Modal */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded bg-[#1266C7] text-white">
            {isTemporada ? "Temporada / Veraneio" : "Venda"}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#D9BB4C]" />
            {property.bairro}, {property.cidade}
          </span>
        </div>

        <h2 className="text-2xl font-black text-white">{property.nome}</h2>
        <p className="text-2xl font-black text-[#D9BB4C] mt-1">{formatPrice(property)}</p>

        {/* Imagem do Imóvel */}
        <div className="my-4 h-56 rounded-2xl overflow-hidden relative">
          <img
            src={
              property.fotos?.[0] ||
              "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
            }
            alt={property.nome}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Ficha Resumida */}
        <div className="grid grid-cols-4 gap-2 bg-[#080C14] border border-[#1F2937] p-3 rounded-xl text-center text-xs text-slate-300 mb-6">
          <div>
            <p className="text-slate-500 font-bold text-[10px]">ÁREA</p>
            <p className="font-extrabold">{property.caracteristicas?.area_m2 || 120} m²</p>
          </div>
          <div>
            <p className="text-slate-500 font-bold text-[10px]">QUARTOS</p>
            <p className="font-extrabold">{property.caracteristicas?.quartos || 3}</p>
          </div>
          <div>
            <p className="text-slate-500 font-bold text-[10px]">SUÍTES</p>
            <p className="font-extrabold">{property.caracteristicas?.suites || 2}</p>
          </div>
          <div>
            <p className="text-slate-500 font-bold text-[10px]">VAGAS</p>
            <p className="font-extrabold">{property.caracteristicas?.vagas || 2}</p>
          </div>
        </div>

        {/* Formulário de Atendimento Imediato (Integrado ao CRM) */}
        <div className="border-t border-[#1F2937] pt-5">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#D9BB4C]" />
            Fale com o Corretor Especialista deste Imóvel
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Preencha seus dados para receber a ficha técnica completa e agendar uma visita presencial ou por vídeo.
          </p>

          {enviado ? (
            <div className="p-4 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-xl text-xs flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="font-bold">
                  Solicitação registrada com sucesso no sistema!
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/90 pl-7">
                Seu atendimento foi atribuído via Roleta ao corretor <strong className="text-white">{corretorAtribuido}</strong>, que entrará em contato em instantes via WhatsApp.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Seu Nome</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome completo"
                    className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-3 text-white focus:outline-none focus:border-connect-blue"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">WhatsApp / Telefone</label>
                  <input
                    type="tel"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(85) 99999-9999"
                    className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-3 text-white focus:outline-none focus:border-connect-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-3 text-white focus:outline-none focus:border-connect-blue"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Mensagem (Opcional)</label>
                <textarea
                  rows={2}
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Gostaria de saber mais sobre as condições de pagamento e agendar visita..."
                  className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-3 text-white focus:outline-none focus:border-connect-blue"
                />
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-[#1266C7] hover:bg-[#0D478F] text-white font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-connect-blue/30 transition-all text-xs"
              >
                {enviando ? "Encaminhando ao corretor..." : "Quero Receber Informações Imediatas"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
