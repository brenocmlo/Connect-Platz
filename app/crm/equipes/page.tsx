"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Users2, Zap, AlertCircle } from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";
import { PageHeader } from "@/components/crm/PageHeader";
import { SectionTitle } from "@/components/crm/SectionTitle";
import { AccessDeniedCard } from "@/components/crm/AccessDeniedCard";
import { RoletaDistributionPanel } from "@/components/crm/equipes/RoletaDistributionPanel";
import { InviteCollaboratorModal, InviteCollaboratorData } from "@/components/crm/equipes/InviteCollaboratorModal";
import { RemoveBrokerModal } from "@/components/crm/equipes/RemoveBrokerModal";
import { TeamStatCards } from "@/components/crm/equipes/TeamStatCards";
import { TeamMembersTable } from "@/components/crm/equipes/TeamMembersTable";
import { TeamMember, MemberStatus, STATUS_META } from "@/components/crm/equipes/types";

export default function EquipesPage() {
  const { user, setActionMessage } = useCrm();
  const isAdmin = user?.role === "ADMINISTRADOR";

  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [brokerToRemove, setBrokerToRemove] = useState<TeamMember | null>(null);
  const [activeTab, setActiveTab] = useState<"membros" | "roleta">("membros");

  const flash = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const loadTeam = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/equipes", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Não foi possível carregar a equipe.");
      setTeam(Array.isArray(data.members) ? data.members : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar a equipe.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && isAdmin) loadTeam();
  }, [user, isAdmin, loadTeam]);

  const handleStatusChange = async (id: string, newStatus: MemberStatus) => {
    const previous = team;
    setPendingId(id);
    // Atualização otimista com rollback em caso de falha
    setTeam((prev) => prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m)));
    try {
      const res = await fetch("/api/equipes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, status: newStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Falha ao alterar o status.");
      flash(`Status atualizado para ${STATUS_META[newStatus].label}.`);
    } catch (err) {
      setTeam(previous);
      flash(err instanceof Error ? err.message : "Falha ao alterar o status.");
    } finally {
      setPendingId(null);
    }
  };

  const handleInvite = async (data: InviteCollaboratorData) => {
    const res = await fetch("/api/equipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body?.error || "Não foi possível cadastrar o colaborador.");
    setTeam((prev) => [...prev, body.member as TeamMember].sort((a, b) => a.nome.localeCompare(b.nome)));
    flash(`${data.nome} cadastrado(a). Compartilhe a senha provisória com o profissional.`);
  };

  const handleRemoveBroker = async (member: TeamMember) => {
    const res = await fetch(`/api/equipes?userId=${member.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Falha ao remover o corretor.");
    setTeam((prev) => prev.filter((m) => m.id !== member.id));
    flash(data?.message || `${member.nome} foi removido(a) da equipe com sucesso.`);
  };

  if (user && !isAdmin) {
    return (
      <AccessDeniedCard
        moduleName="a Gestão de Equipes e Corretores"
        allowedLabel="Administradores"
      />
    );
  }

  const tabClass = (active: boolean) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
      active ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Equipe & Roleta Comercial"
        subtitle="Corretores da equipe e disponibilidade de atendimento em tempo real."
        actionLabel="Convidar Colaborador"
        onActionClick={() => setIsInviteModalOpen(true)}
        showPeriodSelector={false}
        showExportButton={false}
      />

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </span>
          <button onClick={loadTeam} className="font-bold underline underline-offset-2">
            Tentar novamente
          </button>
        </div>
      )}

      <TeamStatCards team={team} loading={loading && team.length === 0} />

      <div className="flex bg-muted p-1 rounded-xl gap-1 text-xs font-semibold overflow-x-auto w-fit">
        <button type="button" onClick={() => setActiveTab("membros")} className={tabClass(activeTab === "membros")}>
          <Users2 className="w-4 h-4 text-connect-blue" />
          <span>Quadro de Colaboradores</span>
        </button>
        <button type="button" onClick={() => setActiveTab("roleta")} className={tabClass(activeTab === "roleta")}>
          <Zap className="w-4 h-4 text-connect-blue" />
          <span>Roleta de Distribuição & Fila</span>
        </button>
      </div>

      {activeTab === "roleta" ? (
        <RoletaDistributionPanel members={team} pendingId={pendingId} onStatusChange={handleStatusChange} />
      ) : (
        <div className="space-y-3">
          <SectionTitle>Quadro de Colaboradores</SectionTitle>
          <TeamMembersTable
            team={team}
            loading={loading}
            isAdmin={isAdmin}
            onRequestRemove={(m) => setBrokerToRemove(m)}
          />
        </div>
      )}

      <InviteCollaboratorModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInvite}
      />

      <RemoveBrokerModal
        isOpen={Boolean(brokerToRemove)}
        member={brokerToRemove}
        onClose={() => setBrokerToRemove(null)}
        onConfirm={handleRemoveBroker}
      />
    </div>
  );
}
