"use client";

import React, { useEffect, useRef, useState } from "react";
import { Building2, FileText, MapPin, Mail, Phone, Globe, Clock, Save, Upload, Loader2, Lock } from "lucide-react";
import { SectionTitle } from "@/components/crm/SectionTitle";
import { useCrm } from "@/components/crm/CrmContext";
import { requestJson, useConfigResource, uploadImage, formatBrPhone, formatCnpj } from "./configApi";
import { ConfigCard, ConfigError, ConfigField, ConfigSkeleton, SaveButton, flash, inputClass } from "./ConfigUi";

interface Empresa {
  razaoSocial?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
  site?: string;
}

interface Organizacao {
  nome: string;
  cnpj: string | null;
  creci: string | null;
  logoUrl: string | null;
  logoDarkUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  operatingStart: string;
  operatingEnd: string;
  empresa: Empresa;
}

interface OrgResponse {
  organizacao: Organizacao;
  canEdit: boolean;
}

type FormState = Omit<Organizacao, "empresa" | "cnpj" | "creci"> & Required<Empresa> & { cnpj: string; creci: string };

function toForm(o: Organizacao): FormState {
  return {
    nome: o.nome,
    cnpj: formatCnpj(o.cnpj),
    creci: o.creci || "",
    logoUrl: o.logoUrl,
    logoDarkUrl: o.logoDarkUrl,
    primaryColor: o.primaryColor,
    secondaryColor: o.secondaryColor,
    operatingStart: o.operatingStart,
    operatingEnd: o.operatingEnd,
    razaoSocial: o.empresa.razaoSocial || "",
    telefone: formatBrPhone(o.empresa.telefone),
    email: o.empresa.email || "",
    endereco: o.empresa.endereco || "",
    cidade: o.empresa.cidade || "",
    uf: o.empresa.uf || "",
    site: o.empresa.site || "",
  };
}

export function AdminGeneralTab() {
  const { setActionMessage } = useCrm();
  const { data, loading, error, reload } = useConfigResource<OrgResponse>("/api/configuracoes/organizacao");
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data?.organizacao) setForm(toForm(data.organizacao));
  }, [data]);

  if (loading && !form) return <ConfigSkeleton />;
  if (error && !form) return <ConfigError message={error} onRetry={reload} />;
  if (!form || !data) return null;

  const canEdit = data.canEdit;
  const set = (patch: Partial<FormState>) => setForm((prev) => (prev ? { ...prev, ...patch } : prev));
  const bind = (key: keyof FormState) => ({
    value: (form[key] as string) || "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => set({ [key]: e.target.value } as Partial<FormState>),
    disabled: !canEdit,
    className: inputClass,
  });

  const handleLogo = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setFormError(null);
    try {
      set({ logoUrl: await uploadImage(file, "logos") });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Falha ao enviar o logo.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setSaving(true);
    setFormError(null);
    try {
      const res = await requestJson<OrgResponse>("/api/configuracoes/organizacao", "PATCH", {
        nome: form.nome,
        cnpj: form.cnpj || null,
        creci: form.creci || null,
        logoUrl: form.logoUrl,
        logoDarkUrl: form.logoDarkUrl,
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
        operatingStart: form.operatingStart,
        operatingEnd: form.operatingEnd,
        empresa: {
          razaoSocial: form.razaoSocial,
          telefone: form.telefone,
          email: form.email,
          endereco: form.endereco,
          cidade: form.cidade,
          uf: form.uf,
          site: form.site,
        },
      });
      setForm(toForm(res.organizacao));
      flash(setActionMessage, "Dados corporativos da imobiliária salvos com sucesso!");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Não foi possível salvar os dados.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {!canEdit && (
        <div className="p-3 rounded-lg bg-muted border border-border text-xs text-muted-foreground flex items-center gap-2">
          <Lock className="w-4 h-4 shrink-0" />
          Somente Administradores e Diretores podem editar os dados corporativos.
        </div>
      )}
      {formError && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs">
          {formError}
        </div>
      )}

      {/* 1. DADOS CADASTRAIS */}
      <ConfigCard>
        <SectionTitle title="Dados Cadastrais da Imobiliária" />
        <p className="text-xs text-muted-foreground">
          Informações oficiais utilizadas em contratos, propostas, relatórios e cabeçalhos de recibos.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <ConfigField label="Nome Fantasia *" icon={Building2}>
            <input type="text" required minLength={2} {...bind("nome")} />
          </ConfigField>
          <ConfigField label="Razão Social" icon={FileText}>
            <input type="text" {...bind("razaoSocial")} />
          </ConfigField>
          <ConfigField label="CNPJ">
            <input type="text" inputMode="numeric" placeholder="00.000.000/0000-00" {...bind("cnpj")} />
          </ConfigField>
          <ConfigField label="CRECI Jurídico">
            <input type="text" {...bind("creci")} />
          </ConfigField>
          <ConfigField label="E-mail Comercial" icon={Mail}>
            <input type="email" {...bind("email")} />
          </ConfigField>
          <ConfigField label="Telefone Comercial" icon={Phone}>
            <input type="tel" placeholder="(00) 0000-0000" {...bind("telefone")} />
          </ConfigField>
          <ConfigField label="Site" icon={Globe} className="sm:col-span-2">
            <input type="url" placeholder="https://" {...bind("site")} />
          </ConfigField>
        </div>
      </ConfigCard>

      {/* 2. SEDE */}
      <ConfigCard>
        <SectionTitle title="Localização da Sede" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
          <ConfigField label="Endereço Comercial" icon={MapPin} className="sm:col-span-2">
            <input type="text" {...bind("endereco")} />
          </ConfigField>
          <div>
            <label className="block text-muted-foreground font-semibold mb-1.5">Cidade / UF</label>
            <div className="flex gap-2">
              <input type="text" {...bind("cidade")} />
              <input type="text" maxLength={2} {...bind("uf")} className={`${inputClass} w-16 text-center uppercase`} />
            </div>
          </div>
        </div>
      </ConfigCard>

      {/* 3. JANELA OPERACIONAL */}
      <ConfigCard>
        <SectionTitle title="Janela Operacional da Roleta" />
        <p className="text-xs text-muted-foreground">
          Fora deste horário os leads novos ficam na fila noturna e são distribuídos na abertura seguinte.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <ConfigField label="Início" icon={Clock}>
            <input type="time" required {...bind("operatingStart")} />
          </ConfigField>
          <ConfigField label="Fim" icon={Clock}>
            <input type="time" required {...bind("operatingEnd")} />
          </ConfigField>
        </div>
      </ConfigCard>

      {/* 4. IDENTIDADE VISUAL */}
      <ConfigCard>
        <SectionTitle title="Identidade Visual" />
        <p className="text-xs text-muted-foreground">
          Logo e cores aplicados nos espelhos de vendas e no catálogo público.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
          <div className="p-3.5 bg-muted/40 rounded-lg flex items-center justify-between gap-3">
            {form.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.logoUrl} alt="Logo" className="h-10 max-w-[120px] object-contain" />
            ) : (
              <span className="text-[11px] text-muted-foreground">Nenhum logo enviado</span>
            )}
            <button
              type="button"
              disabled={!canEdit || uploading}
              onClick={() => logoRef.current?.click()}
              className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted flex items-center gap-1.5 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              Logo
            </button>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleLogo(e.target.files?.[0])} />
          </div>
          {(["primaryColor", "secondaryColor"] as const).map((key) => (
            <div key={key} className="p-3.5 bg-muted/40 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-semibold text-foreground block">
                  {key === "primaryColor" ? "Cor Primária" : "Cor Secundária"}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {key === "primaryColor" ? "Botões e destaques" : "Gamificação e metas"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form[key]}
                  disabled={!canEdit}
                  onChange={(e) => set({ [key]: e.target.value.toUpperCase() } as Partial<FormState>)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 disabled:cursor-not-allowed"
                />
                <span className="font-mono text-xs text-muted-foreground">{form[key]}</span>
              </div>
            </div>
          ))}
        </div>
      </ConfigCard>

      {canEdit && (
        <div className="flex justify-end">
          <SaveButton saving={saving} label="Salvar Dados da Imobiliária" icon={Save} disabled={uploading} />
        </div>
      )}
    </form>
  );
}
