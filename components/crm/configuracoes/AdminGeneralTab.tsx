"use client";

import React, { useState } from "react";
import { Building2, FileText, MapPin, Mail, Phone, Palette, Save } from "lucide-react";
import { SectionTitle } from "@/components/crm/SectionTitle";
import { useCrm } from "@/components/crm/CrmContext";

export function AdminGeneralTab() {
  const { setActionMessage } = useCrm();
  const [nomeFantasia, setNomeFantasia] = useState("Connect Platz Imobiliária");
  const [razaoSocial, setRazaoSocial] = useState("Connect Platz Negócios Imobiliários LTDA");
  const [cnpj, setCnpj] = useState("12.345.678/0001-90");
  const [creci, setCreci] = useState("12345-J");
  const [email, setEmail] = useState("contato@connectplatz.com.br");
  const [telefone, setTelefone] = useState("(85) 3030-4040");
  const [endereco, setEndereco] = useState("Av. Washington Soares, 3000 - Edson Queiroz");
  const [cidade, setCidade] = useState("Fortaleza");
  const [estado, setEstado] = useState("CE");
  const [primaryColor, setPrimaryColor] = useState("#1266C7");
  const [secondaryColor, setSecondaryColor] = useState("#D9BB4C");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage("Dados corporativos da imobiliária salvos com sucesso!");
    setTimeout(() => setActionMessage(null), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* 1. DADOS CADASTRAIS DA EMPRESA */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
        <SectionTitle title="Dados Cadastrais da Imobiliária" />
        <p className="text-xs text-muted-foreground">
          Informações oficiais utilizadas em contratos, propostas, relatórios e cabeçalhos de recibos.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div>
            <label className="block text-muted-foreground font-semibold mb-1.5">Nome Fantasia</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={nomeFantasia}
                onChange={(e) => setNomeFantasia(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-foreground focus:ring-1 focus:ring-connect-blue focus:border-connect-blue transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-muted-foreground font-semibold mb-1.5">Razão Social</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-foreground focus:ring-1 focus:ring-connect-blue focus:border-connect-blue transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-muted-foreground font-semibold mb-1.5">CNPJ</label>
            <input
              type="text"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:ring-1 focus:ring-connect-blue focus:border-connect-blue transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-muted-foreground font-semibold mb-1.5">CRECI Jurídico</label>
            <input
              type="text"
              value={creci}
              onChange={(e) => setCreci(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:ring-1 focus:ring-connect-blue focus:border-connect-blue transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-muted-foreground font-semibold mb-1.5">E-mail Comercial</label>
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
            <label className="block text-muted-foreground font-semibold mb-1.5">Telefone Comercial</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-foreground focus:ring-1 focus:ring-connect-blue focus:border-connect-blue transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. LOCALIZAÇÃO E SEDE */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
        <SectionTitle title="Localização da Sede" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
          <div className="sm:col-span-2">
            <label className="block text-muted-foreground font-semibold mb-1.5">Endereço Comercial</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-foreground focus:ring-1 focus:ring-connect-blue focus:border-connect-blue transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-muted-foreground font-semibold mb-1.5">Cidade / UF</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:ring-1 focus:ring-connect-blue focus:border-connect-blue transition-all"
              />
              <input
                type="text"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-16 bg-background border border-border rounded-lg px-2 py-2 text-foreground text-center focus:ring-1 focus:ring-connect-blue focus:border-connect-blue transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. IDENTIDADE VISUAL */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
        <SectionTitle title="Paleta de Cores Institucionais" />
        <p className="text-xs text-muted-foreground">
          Padrão visual corporativo aplicado nos espelhos de vendas e catálogo público.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-3.5 bg-muted/40 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-semibold text-foreground block">Cor Primária (Connect Blue)</span>
              <span className="text-[11px] text-muted-foreground">Botões, destaques e cabeçalhos</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <span className="font-mono text-xs text-muted-foreground">{primaryColor}</span>
            </div>
          </div>

          <div className="p-3.5 bg-muted/40 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-semibold text-foreground block">Cor Secundária (Platz Gold)</span>
              <span className="text-[11px] text-muted-foreground">Gamificação, pódios e metas</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <span className="font-mono text-xs text-muted-foreground">{secondaryColor}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-connect-blue hover:bg-connect-blue/90 text-white font-semibold text-xs px-6 py-2.5 rounded-lg shadow-md shadow-connect-blue/20 transition-all hover:scale-[1.02] flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Salvar Dados da Imobiliária
        </button>
      </div>
    </form>
  );
}
