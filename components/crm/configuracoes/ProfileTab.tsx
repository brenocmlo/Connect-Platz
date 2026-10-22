"use client";

import React, { useEffect, useRef, useState } from "react";
import { User, Mail, Phone, Shield, Camera, Loader2, Save } from "lucide-react";
import { SectionTitle } from "@/components/crm/SectionTitle";
import { useCrm } from "@/components/crm/CrmContext";
import { ChangePasswordSection } from "./ChangePasswordSection";
import { AccessibilitySection } from "./AccessibilitySection";
import { NotificationPreferencesCard } from "./NotificationPreferencesCard";
import { requestJson, useConfigResource, uploadImage, formatBrPhone } from "./configApi";
import { ConfigCard, ConfigError, ConfigField, ConfigSkeleton, SaveButton, flash, inputClass } from "./ConfigUi";

interface Profile {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  creci: string | null;
  bio: string | null;
  photoUrl: string | null;
  role: string;
}

const ROLE_LABEL: Record<string, string> = {
  ADMINISTRADOR: "Administrador",
  DIRETOR: "Diretor",
  GERENTE: "Gerente",
  CORRETOR: "Corretor",
};

export function ProfileTab() {
  const { setActionMessage } = useCrm();
  const { data, loading, error, reload } = useConfigResource<{ profile: Profile }>("/api/configuracoes/perfil");

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [creci, setCreci] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fillForm = (p: Profile) => {
    setNome(p.nome);
    setTelefone(formatBrPhone(p.telefone));
    setCreci(p.creci || "");
    setBio(p.bio || "");
    setPhotoUrl(p.photoUrl);
  };

  useEffect(() => {
    if (data?.profile) fillForm(data.profile);
  }, [data]);

  const handlePhoto = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("Selecione um arquivo de imagem (JPG, PNG ou WEBP).");
      return;
    }
    setUploading(true);
    setFormError(null);
    try {
      setPhotoUrl(await uploadImage(file, "avatars"));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Falha ao enviar a foto.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const res = await requestJson<{ profile: Profile }>("/api/configuracoes/perfil", "PATCH", {
        nome,
        telefone: telefone || null,
        creci: creci || null,
        bio: bio || null,
        photoUrl,
      });
      fillForm(res.profile);
      flash(setActionMessage, "Perfil atualizado com sucesso!");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Não foi possível salvar o perfil.");
    } finally {
      setSaving(false);
    }
  };

  const profile = data?.profile;
  const initials =
    nome
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <div className="space-y-6">
      {loading && !profile ? (
        <ConfigSkeleton />
      ) : error && !profile ? (
        <ConfigError message={error} onRetry={reload} />
      ) : profile ? (
        <form onSubmit={handleSave} className="space-y-6">
          <ConfigCard className="space-y-6">
            <SectionTitle title="Informações Pessoais & Perfil Profissional" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-border">
              <div className="relative group">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl} alt={nome} className="w-20 h-20 rounded-full object-cover shadow-md" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-connect-blue text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-connect-blue/20">
                    {initials}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-connect-blue text-white shadow hover:bg-connect-blue/90 transition-transform group-hover:scale-110"
                  title="Alterar foto de perfil"
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhoto(e.target.files?.[0])}
                />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">{nome || profile.nome}</h3>
                <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-connect-blue/10 text-connect-blue font-semibold text-[11px]">
                    {ROLE_LABEL[profile.role] || profile.role}
                  </span>
                  {profile.creci && <span>CRECI {profile.creci}</span>}
                </p>
                {photoUrl !== profile.photoUrl && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400">
                    Nova foto carregada — clique em salvar para aplicar.
                  </p>
                )}
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <ConfigField label="Nome Completo *" icon={User}>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} required minLength={2} />
              </ConfigField>

              <ConfigField label="E-mail de Acesso" icon={Mail} hint="O e-mail de login só pode ser alterado pela gestão.">
                <input type="email" value={profile.email} className={inputClass} disabled readOnly />
              </ConfigField>

              <ConfigField label="WhatsApp / Telefone" icon={Phone} hint="DDD + número. Usado nos links wa.me.">
                <input
                  type="tel"
                  inputMode="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className={inputClass}
                />
              </ConfigField>

              <ConfigField label="CRECI Individual" icon={Shield}>
                <input type="text" value={creci} onChange={(e) => setCreci(e.target.value)} placeholder="Ex.: 00000-F" className={inputClass} />
              </ConfigField>

              <ConfigField label="Biografia Profissional" className="sm:col-span-2">
                <textarea
                  rows={3}
                  value={bio}
                  maxLength={1000}
                  onChange={(e) => setBio(e.target.value)}
                  className={`${inputClass} p-3`}
                  placeholder="Descreva suas especialidades e regiões de atuação..."
                />
              </ConfigField>
            </div>

            <div className="flex justify-end">
              <SaveButton saving={saving} label="Salvar Alterações do Perfil" icon={Save} disabled={uploading} />
            </div>
          </ConfigCard>
        </form>
      ) : null}

      {/* Preferências locais deste dispositivo */}
      <NotificationPreferencesCard />
      <AccessibilitySection />

      {/* Troca de senha com verificação da senha atual */}
      <ChangePasswordSection />
    </div>
  );
}
