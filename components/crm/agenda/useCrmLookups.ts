"use client";

// Carrega listas reais (leads, empreendimentos e membros da equipe) para comboboxes de formulários.
// Ids que não são UUID são descartados para nunca vincular registros de exemplo.

import { useEffect, useState } from "react";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface LookupLead {
  id: string;
  nome: string;
  telefone?: string | null;
  email?: string | null;
  corretorId?: string | null;
  corretorNome?: string | null;
  empreendimentoInteresse?: string | null;
}

export interface LookupProperty {
  id: string;
  nome: string;
  construtora?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  endereco?: string | null;
  valorVenda?: number | null;
  valorDiaria?: number | null;
  taxaLimpeza?: number | null;
  modalidade?: string;
}

export interface LookupMember {
  id: string;
  nome: string;
  role: string;
}

interface Options {
  enabled: boolean;
  leads?: boolean;
  properties?: boolean;
  members?: boolean;
}

export function useCrmLookups({ enabled, leads = true, properties = true, members = false }: Options) {
  const [leadList, setLeadList] = useState<LookupLead[]>([]);
  const [propertyList, setPropertyList] = useState<LookupProperty[]>([]);
  const [memberList, setMemberList] = useState<LookupMember[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [leadsRes, propsRes, membersRes] = await Promise.all([
          leads ? fetch("/api/leads").catch(() => null) : null,
          properties ? fetch("/api/properties").catch(() => null) : null,
          members ? fetch("/api/equipes").catch(() => null) : null,
        ]);
        if (cancelled) return;

        if (leadsRes?.ok) {
          const data = await leadsRes.json();
          setLeadList(
            (data.leads || [])
              .filter((l: any) => UUID_RE.test(String(l.id)))
              .map((l: any) => ({
                id: l.id,
                nome: l.nome,
                telefone: l.telefone,
                email: l.email,
                corretorId: l.corretorId ?? l.corretor?.id ?? null,
                corretorNome: l.corretor?.nome ?? null,
                empreendimentoInteresse: l.empreendimentoInteresse ?? null,
              }))
          );
        }

        if (propsRes?.ok) {
          const data = await propsRes.json();
          setPropertyList(
            (data.properties || [])
              .filter((p: any) => UUID_RE.test(String(p.id)))
              .map((p: any) => ({
                id: p.id,
                nome: p.nome,
                construtora: p.construtora,
                bairro: p.bairro,
                cidade: p.cidade,
                endereco: p.endereco,
                valorVenda: p.valorVenda != null ? Number(p.valorVenda) : null,
                valorDiaria: p.valorDiaria != null ? Number(p.valorDiaria) : null,
                taxaLimpeza: p.taxaLimpeza != null ? Number(p.taxaLimpeza) : null,
                modalidade: p.modalidade,
              }))
          );
        }

        // /api/equipes responde 403 para corretor — nesse caso a lista fica vazia
        if (membersRes?.ok) {
          const data = await membersRes.json();
          setMemberList(
            (data.members || [])
              .filter((m: any) => UUID_RE.test(String(m.id)))
              .map((m: any) => ({ id: m.id, nome: m.nome, role: m.role }))
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [enabled, leads, properties, members]);

  return { leads: leadList, properties: propertyList, members: memberList, loading };
}
