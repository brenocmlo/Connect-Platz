"use client";

import React, { useState } from "react";
import {
  Users2,
  ShieldCheck,
  UserPlus,
  Mail,
  Phone,
  CheckCircle2,
  Building,
  Crown,
} from "lucide-react";
import { useCrm } from "@/components/crm/CrmContext";

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
  const { setActionMessage } = useCrm();
  const [team, setTeam] = useState<TeamMember[]>(mockTeam);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"CORRETOR" | "GERENTE">("CORRETOR");

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: TeamMember = {
      id: `m-${Date.now()}`,
      nome: inviteName,
      email: inviteEmail,
      telefone: "85988880000",
      role: inviteRole,
      equipe: "Equipe Litoral & Alto Padrão",
      leadsAtivos: 0,
      status: "DISPONIVEL",
    };
    setTeam([...team, newMember]);
    setIsInviteModalOpen(false);
    setInviteName("");
    setInviteEmail("");
    setActionMessage(`Convite enviado com sucesso para ${inviteEmail}!`);
    setTimeout(() => setActionMessage(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. TOPBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0A0E17] border border-[#1C2537] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-connect-blue/15 border border-connect-blue/30 text-connect-blue">
            <Users2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Hierarquia Comercial & Gestão de Equipes</h2>
            <p className="text-xs text-slate-400">
              Isolamento de visibilidade por gerente e controle de participação na Roleta Round-Robin.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-connect-blue hover:bg-[#0D478F] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-connect-blue/20 transition-all hover:scale-105"
        >
          <UserPlus className="w-4 h-4" />
          Convidar Novo Corretor
        </button>
      </div>

      {/* 2. LISTA DE MEMBROS DA EQUIPE */}
      <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl shadow-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0F1624] text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-[#1C2537]">
            <tr>
              <th className="py-3 px-4">Nome do Profissional</th>
              <th className="py-3 px-4">Cargo / Nível</th>
              <th className="py-3 px-4">Equipe Vinculada</th>
              <th className="py-3 px-4">Leads em Carteira</th>
              <th className="py-3 px-4">Status Roleta</th>
              <th className="py-3 px-4 text-right">E-mail Corporativo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C2537]">
            {team.map((member) => (
              <tr key={member.id} className="hover:bg-[#0D131F]">
                <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-[#D9BB4C] font-bold text-xs flex items-center justify-center">
                    {member.nome.charAt(0)}
                  </div>
                  {member.nome}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      member.role === "DIRETOR"
                        ? "bg-purple-950 text-purple-300 border border-purple-800"
                        : member.role === "GERENTE"
                        ? "bg-amber-950 text-amber-300 border border-amber-800"
                        : "bg-blue-950 text-blue-300 border border-blue-800"
                    }`}
                  >
                    {member.role}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-300">{member.equipe}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-white">{member.leadsAtivos} leads</td>
                <td className="py-3.5 px-4">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      member.status === "DISPONIVEL"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : member.status === "EM_VISITA"
                        ? "bg-amber-950 text-amber-400 border border-amber-800"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {member.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-slate-400">{member.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. MODAL CONVIDAR CORRETOR */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Convidar Membro para a Equipe</h3>
            <form onSubmit={handleSendInvite} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fernanda Lima"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">E-mail Corporativo</label>
                <input
                  type="email"
                  required
                  placeholder="fernanda@connectplatz.com.br"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Função</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
                >
                  <option value="CORRETOR">Corretor de Vendas</option>
                  <option value="GERENTE">Gerente de Equipe</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#111827] text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-connect-blue text-white font-extrabold"
                >
                  Enviar Convite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
