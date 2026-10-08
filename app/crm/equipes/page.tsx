"use client";

import React, { useState } from "react";
import {
  Users2,
  UserPlus,
  Mail,
  CheckCircle2,
  Crown,
  UserCheck,
  Clock,
  Zap,
} from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { PageHeader } from "@/components/crm/PageHeader";
import { SectionTitle } from "@/components/crm/SectionTitle";
import { CountUpNumber } from "@/components/crm/CountUpNumber";
import { AccessDeniedCard } from "@/components/crm/AccessDeniedCard";
import { RoletaDistributionPanel } from "@/components/crm/equipes/RoletaDistributionPanel";
import { InviteCollaboratorModal, InviteCollaboratorData } from "@/components/crm/equipes/InviteCollaboratorModal";
import { logAuditEvent } from "@/lib/services/auditLogger";

interface TeamMember {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  role: "DIRETOR" | "GERENTE" | "CORRETOR";
  equipe: string;
  leadsAtivos: number;
  status: "DISPONIVEL" | "EM_VISITA" | "PAUSA";
}

const mockTeam: TeamMember[] = [
  { id: "m-1", nome: "Pietro Costa", email: "pietro@connectplatz.com.br", telefone: "85999990001", role: "DIRETOR", equipe: "Diretoria Geral", leadsAtivos: 18, status: "DISPONIVEL" },
  { id: "m-2", nome: "Mariana Oliveira", email: "mariana.gerente@connectplatz.com.br", telefone: "85999990002", role: "GERENTE", equipe: "Equipe Litoral & Alto Padrão", leadsAtivos: 24, status: "DISPONIVEL" },
  { id: "m-3", nome: "Lucas Santos", email: "lucas@connectplatz.com.br", telefone: "85999990003", role: "CORRETOR", equipe: "Equipe Litoral & Alto Padrão", leadsAtivos: 14, status: "DISPONIVEL" },
  { id: "m-4", nome: "Rafael Mendes", email: "rafael@connectplatz.com.br", telefone: "85999990004", role: "CORRETOR", equipe: "Equipe Litoral & Alto Padrão", leadsAtivos: 9, status: "EM_VISITA" },
  { id: "m-5", nome: "Patrícia Dantas", email: "patricia@connectplatz.com.br", telefone: "85999990005", role: "CORRETOR", equipe: "Equipe Fortaleza Urbana", leadsAtivos: 11, status: "DISPONIVEL" },
];

export default function EquipesPage() {
  const { user, setActionMessage } = useCrm();

  if (user && user.role === "CORRETOR") {
    return <AccessDeniedCard moduleName="a Gestão de Equipes e Corretores" />;
  }

  const [team, setTeam] = useState<TeamMember[]>(mockTeam);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"membros" | "roleta">("membros");

  const totalAtivos = team.filter((m) => m.status === "DISPONIVEL").length;
  const totalVisitas = team.filter((m) => m.status === "EM_VISITA").length;
  const totalGerentes = team.filter((m) => m.role === "GERENTE" || m.role === "DIRETOR").length;

  const handleStatusChange = (id: string, newStatus: "DISPONIVEL" | "EM_VISITA" | "PAUSA") => {
    setTeam((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
    );
    setActionMessage("Status do corretor atualizado na Roleta!");
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleSimulateDistribution = (corretorNome: string) => {
    setTeam((prev) => {
      const idx = prev.findIndex((m) => m.nome === corretorNome);
      if (idx === -1) return prev;
      const updated = [...prev];
      const broker = updated[idx];
      updated[idx] = { ...broker, leadsAtivos: broker.leadsAtivos + 1 };
      const [item] = updated.splice(idx, 1);
      updated.push(item);
      return updated;
    });
    setActionMessage(`Lead distribuído com sucesso para ${corretorNome}!`);
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleSendInvite = (data: InviteCollaboratorData) => {
    const newMember: TeamMember = {
      id: `m-${Date.now()}`,
      nome: data.nome,
      email: data.email,
      telefone: data.telefone || "85988880000",
      role: data.role,
      equipe: "Equipe Litoral & Alto Padrão",
      leadsAtivos: 0,
      status: "DISPONIVEL",
    };
    setTeam([...team, newMember]);
    setIsInviteModalOpen(false);
    setActionMessage(`Convite enviado para ${data.email} com senha temporária configurada!`);

    logAuditEvent({
      usuario: {
        id: user?.id || "u-1",
        nome: user?.nome || "Administrador",
        email: user?.email || "admin@connectplatz.com.br",
        role: user?.role || "ADMINISTRADOR",
      },
      acao: "Convite de Colaborador",
      tipoAcao: "INVITE",
      modulo: "EQUIPES",
      detalhes: `Convite enviado para ${data.nome} (${data.email}) com perfil ${data.role}. Senha temporária configurada (troca no primeiro login: ${data.exigirTrocaPrimeiroAcesso ? "Sim" : "Não"}).`,
      entidadeAfetada: {
        tipo: "Colaborador",
        nome: data.nome,
      },
    });

    setTimeout(() => setActionMessage(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. CABEÇALHO PADRÃO SEÇÃO 5.2 */}
      <PageHeader
        title="Equipe & Roleta Comercial"
        subtitle="Hierarquia de corretores, gerentes e disponibilidade de atendimento em tempo real."
        actionLabel="Convidar Colaborador"
        onActionClick={() => setIsInviteModalOpen(true)}
        showPeriodSelector={false}
        showExportButton={true}
      />

      {/* 2. STATCARDS DA EQUIPE */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Total de Membros
            </span>
            <span className="text-2xl font-black text-foreground mt-1 block">
              <CountUpNumber value={team.length} />
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-connect-blue/10 text-connect-blue">
            <Users2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Ativos na Roleta
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              <CountUpNumber value={totalAtivos} />
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Em Visita Externa
            </span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
              <CountUpNumber value={totalVisitas} />
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Liderança / Gestão
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              <CountUpNumber value={totalGerentes} />
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-platz-gold/15 text-platz-gold">
            <Crown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. TABS SHADCN STYLE: MEMBROS vs ROLETA */}
      <div className="flex bg-muted p-1 rounded-xl gap-1 text-xs font-semibold overflow-x-auto w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("membros")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === "membros"
              ? "bg-card text-foreground shadow-xs font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users2 className="w-4 h-4 text-connect-blue" />
          <span>Quadro de Colaboradores</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("roleta")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === "roleta"
              ? "bg-card text-foreground shadow-xs font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Zap className="w-4 h-4 text-connect-blue" />
          <span>Roleta de Distribuição & Fila</span>
        </button>
      </div>

      {activeTab === "roleta" ? (
        <RoletaDistributionPanel
          members={team}
          onStatusChange={handleStatusChange}
          onSimulateDistribution={handleSimulateDistribution}
        />
      ) : (
        <div className="space-y-3">
          <SectionTitle>Quadro de Colaboradores</SectionTitle>

          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/60 text-[10px] text-muted-foreground font-bold uppercase tracking-wider border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Nome do Profissional</th>
                    <th className="py-3 px-4">Cargo / Nível</th>
                    <th className="py-3 px-4">Equipe Vinculada</th>
                    <th className="py-3 px-4 text-center">Leads em Carteira</th>
                    <th className="py-3 px-4 text-center">Status Roleta</th>
                    <th className="py-3 px-4 text-right">E-mail Corporativo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {team.map((member) => (
                    <tr
                      key={member.id}
                      className="hover:bg-connect-blue/5 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-foreground flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-connect-blue text-white flex items-center justify-center font-bold text-xs">
                          {member.nome.charAt(0)}
                        </div>
                        <span>{member.nome}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            member.role === "DIRETOR"
                              ? "bg-platz-gold/20 text-amber-700 dark:text-[#F8DA56] border border-platz-gold/40"
                              : member.role === "GERENTE"
                              ? "bg-connect-blue/15 text-connect-blue border border-connect-blue/30"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {member.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">{member.equipe}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-foreground">
                        {member.leadsAtivos}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            member.status === "DISPONIVEL"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                              : member.status === "EM_VISITA"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 border border-amber-300 dark:border-amber-800"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {member.status === "DISPONIVEL" ? "Disponível (Na Roleta)" : "Em Visita"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-muted-foreground">
                        {member.email}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL DE CONVITE */}
      <InviteCollaboratorModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleSendInvite}
      />
    </div>
  );
}
