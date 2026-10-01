"use client";

import React, { useState } from "react";

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (leadData: { nome: string; telefone: string; email?: string }) => void;
}

export function NewLeadModal({ isOpen, onClose, onSubmit }: NewLeadModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ nome: name, telefone: phone, email: email || undefined });
    setName("");
    setPhone("");
    setEmail("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0A0E17] border border-[#1C2537] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <h3 className="text-base font-bold text-white">Cadastrar Novo Lead Manual</h3>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Nome Completo</label>
            <input
              type="text"
              required
              placeholder="Ex: Carlos Eduardo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Telefone / WhatsApp</label>
            <input
              type="text"
              required
              placeholder="85999887766"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">E-mail (Opcional)</label>
            <input
              type="email"
              placeholder="carlos@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-2.5 text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#111827] text-slate-300 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#D9BB4C] text-black font-extrabold"
            >
              Salvar Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
