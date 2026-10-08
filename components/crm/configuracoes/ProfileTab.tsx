"use client";

import React, { useState } from "react";
import { User, Mail, Phone, Shield, Camera, Lock, Bell, CheckCircle2 } from "lucide-react";
import { SectionTitle } from "@/components/crm/SectionTitle";
import { useCrm } from "@/components/crm/CrmContext";
import { ChangePasswordSection } from "./ChangePasswordSection";
import { AccessibilitySection } from "./AccessibilitySection";

export function ProfileTab() {
  const { user, setActionMessage } = useCrm();
  const [name, setName] = useState(user?.nome || "Robson Carvalho");
  const [email, setEmail] = useState(user?.email || "robson@connectplatz.com.br");
  const [phone, setPhone] = useState("(85) 99999-8877");
  const [creci, setCreci] = useState(user?.creci || "18942-F");
  const [bio, setBio] = useState(
    "Especialista em lançamentos de alto padrão e oportunidades de investimento imobiliário."
  );
  const [notifySla, setNotifySla] = useState(true);
  const [notifyNewLead, setNotifyNewLead] = useState(true);
  const [notifyAppointments, setNotifyAppointments] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage("Perfil atualizado com sucesso!");
    setTimeout(() => setActionMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. SEÇÃO DE FOTO & DADOS BÁSICOS */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <SectionTitle title="Informações Pessoais & Perfil Profissional" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-border">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1266C7] to-[#0D478F] text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-connect-blue/20">
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-connect-blue text-white shadow hover:bg-connect-blue/90 transition-transform group-hover:scale-110"
                title="Alterar foto de perfil"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">{name}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-connect-blue/10 text-connect-blue font-semibold text-[11px]">
                  {user?.role || "Administrador / CEO"}
                </span>
                <span>• CRECI {creci}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-muted-foreground font-semibold mb-1.5">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-foreground focus:ring-1 focus:ring-connect-blue focus:border-connect-blue transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-muted-foreground font-semibold mb-1.5">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-foreground focus:ring-1 focus:ring-connect-blue focus:border-connect-blue transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-muted-foreground font-semibold mb-1.5">WhatsApp / Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-foreground focus:ring-1 focus:ring-connect-blue focus:border-connect-blue transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-muted-foreground font-semibold mb-1.5">CRECI Individual</label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={creci}
                  onChange={(e) => setCreci(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-foreground focus:ring-1 focus:ring-connect-blue focus:border-connect-blue transition-all"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-muted-foreground font-semibold mb-1.5">Biografia Profissional</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:ring-1 focus:ring-connect-blue focus:border-connect-blue transition-all"
                placeholder="Descreva suas especialidades e regiões de atuação..."
              />
            </div>
          </div>
        </div>

        {/* 2. NOTIFICAÇÕES & PREFERÊNCIAS */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <SectionTitle title="Preferências de Notificação" />
          <p className="text-xs text-muted-foreground">
            Controle quais alertas e eventos devem disparar notificações visuais e sonoras no CRM.
          </p>

          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between p-3.5 bg-muted/40 rounded-lg cursor-pointer hover:bg-muted/60 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-connect-blue/10 text-connect-blue flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    Alertas de Estouro de SLA
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Aviso antecipado de 5 minutos antes do transbordo para o bolsão
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifySla}
                onChange={(e) => setNotifySla(e.target.checked)}
                className="w-4 h-4 rounded text-connect-blue focus:ring-connect-blue"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-muted/40 rounded-lg cursor-pointer hover:bg-muted/60 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    Novo Lead Atribuído
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Notificar instantaneamente quando a roleta distribuir uma oportunidade
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyNewLead}
                onChange={(e) => setNotifyNewLead(e.target.checked)}
                className="w-4 h-4 rounded text-connect-blue focus:ring-connect-blue"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-muted/40 rounded-lg cursor-pointer hover:bg-muted/60 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    Compromissos & Visitas do Dia
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Resumo matinal dos agendamentos marcados para a sua agenda
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyAppointments}
                onChange={(e) => setNotifyAppointments(e.target.checked)}
                className="w-4 h-4 rounded text-connect-blue focus:ring-connect-blue"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-connect-blue hover:bg-connect-blue/90 text-white font-semibold text-xs px-6 py-2.5 rounded-lg shadow-md shadow-connect-blue/20 transition-all hover:scale-[1.02]"
          >
            Salvar Alterações do Perfil
          </button>
        </div>
      </form>

      {/* 3. SEÇÃO DE ACESSIBILIDADE E TAMANHO DE FONTE */}
      <AccessibilitySection />

      {/* 4. SEÇÃO DE ALTERAÇÃO DE SENHA COM CONFIRMAÇÃO */}
      <ChangePasswordSection />
    </div>
  );
}
